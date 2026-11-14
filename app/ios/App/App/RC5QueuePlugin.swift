import Foundation
import Capacitor
import Security
import SQLite3
import CryptoKit
import UIKit

private func failure(_ message: String) -> NSError { NSError(domain: "RC5", code: 1, userInfo: [NSLocalizedDescriptionKey: message]) }
private func sha(_ text: String) -> String { SHA256.hash(data: Data(text.utf8)).map { String(format: "%02x", $0) }.joined() }
private func json(_ value: Any) throws -> Data { try JSONSerialization.data(withJSONObject: value, options: [.sortedKeys, .withoutEscapingSlashes]) }
private func object(_ data: Data) throws -> [String: Any] { guard let value = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw failure("Expected JSON object") }; return value }
private func validEndpoint(_ value: String) -> Bool { guard let u = URLComponents(string: value) else { return false }; return u.scheme == "https" && u.host == "script.google.com" && u.query == nil && u.fragment == nil && u.user == nil && u.password == nil && u.path.range(of: "^/macros/s/[^/]+/exec$", options: .regularExpression) != nil }

final class RC5Vault {
    static let shared = RC5Vault()
    private let lock = NSRecursiveLock()
    private let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: "com.meera.rc5.session", kSecAttrAccount as String: "active"]
    func get() throws -> [String: Any]? {
        lock.lock(); defer { lock.unlock() }
        var q = query; q[kSecReturnData as String] = true; var value: CFTypeRef?
        let status = SecItemCopyMatching(q as CFDictionary, &value)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = value as? Data else { throw failure("Keychain unavailable") }
        return try object(data)
    }
    func set(_ session: [String: Any]) throws {
        lock.lock(); defer { lock.unlock() }
        var item = query; item[kSecValueData as String] = try json(session)
        item[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        let update: [String: Any] = [kSecValueData as String: try json(session), kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly]
        let found = SecItemUpdate(query as CFDictionary, update as CFDictionary)
        if found == errSecItemNotFound { guard SecItemAdd(item as CFDictionary, nil) == errSecSuccess else { throw failure("Keychain write failed") } }
        else if found != errSecSuccess { throw failure("Keychain update failed") }
    }
    func beginChange() throws -> String {
        lock.lock(); defer { lock.unlock() }
        let revision=UUID().uuidString
        UserDefaults.standard.set(revision,forKey:"rc5-auth-revision")
        try clear()
        return revision
    }
    func completeChange(_ snapshot: [String: Any], revision: String) throws {
        lock.lock(); defer { lock.unlock() }
        guard UserDefaults.standard.string(forKey:"rc5-auth-revision") == revision else { throw failure("Account changed while authenticating") }
        try set(snapshot)
    }
    func clear() throws { lock.lock(); defer { lock.unlock() }; let status = SecItemDelete(query as CFDictionary); if status != errSecSuccess && status != errSecItemNotFound { throw failure("Keychain clear failed") } }
    func current(_ session: [String: Any]) throws -> Bool { try get()?["epoch"] as? String == session["epoch"] as? String }
    func expire(_ session: [String: Any]) throws { lock.lock(); defer { lock.unlock() }; if try current(session) { try clear() } }
}

final class RC5Store {
    static let shared = RC5Store()
    private var db: OpaquePointer?
    private let lock = NSRecursiveLock()
    private let transient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
    let directory: URL
    private init() {
        directory = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("RC5", isDirectory: true)
        do {
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication])
            var excluded = URLResourceValues(); excluded.isExcludedFromBackup = true; var dir = directory; try dir.setResourceValues(excluded)
            guard sqlite3_open_v2(directory.appendingPathComponent("queue.sqlite").path, &db, SQLITE_OPEN_CREATE | SQLITE_OPEN_READWRITE | SQLITE_OPEN_FULLMUTEX, nil) == SQLITE_OK else { throw failure("SQLite open failed") }
            try execute("PRAGMA journal_mode=WAL"); try execute("PRAGMA synchronous=FULL")
            try execute("CREATE TABLE IF NOT EXISTS queue(id TEXT PRIMARY KEY,owner TEXT NOT NULL,endpoint TEXT NOT NULL,payload TEXT NOT NULL,digest TEXT NOT NULL,state TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,next INTEGER NOT NULL DEFAULT 0,lease INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL,cloud TEXT NOT NULL DEFAULT '',error TEXT NOT NULL DEFAULT '')")
            try execute("CREATE INDEX IF NOT EXISTS pending ON queue(owner,endpoint,next,lease)")
            try execute("CREATE TABLE IF NOT EXISTS uploads(task INTEGER PRIMARY KEY,epoch TEXT,owner TEXT,endpoint TEXT,file TEXT,rows TEXT)")
        } catch { if db != nil { sqlite3_close(db) }; db = nil }
    }
    @discardableResult func execute(_ sql: String, _ values: [String] = []) throws -> [[String: Any]] {
        lock.lock(); defer { lock.unlock() }; guard let db = db else { throw failure("SQLite unavailable; no upload started") }
        var statement: OpaquePointer?; guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else { throw failure("SQLite prepare failed") }; defer { sqlite3_finalize(statement) }
        for (index, value) in values.enumerated() { guard sqlite3_bind_text(statement, Int32(index + 1), value, -1, transient) == SQLITE_OK else { throw failure("SQLite bind failed") } }
        var rows = [[String: Any]](); var status = sqlite3_step(statement)
        while status == SQLITE_ROW {
            var row = [String: Any](); for i in 0..<sqlite3_column_count(statement) { let key = String(cString: sqlite3_column_name(statement, i)); if let text = sqlite3_column_text(statement, i) { row[key] = String(cString: text) } }
            rows.append(row); status = sqlite3_step(statement)
        }
        guard status == SQLITE_DONE else { throw failure("SQLite transaction failed") }; return rows
    }
    private func record(_ r: [String: Any]) -> [String: Any] { ["requestId": r["id"] ?? "", "owner": r["owner"] ?? "", "endpoint": r["endpoint"] ?? "", "payloadJson": r["payload"] ?? "", "digest": r["digest"] ?? "", "state": r["state"] ?? "", "attempts": Int(r["attempts"] as? String ?? "0") ?? 0, "createdAt": r["created"] ?? "", "cloudReceivedAt": r["cloud"] ?? "", "error": r["error"] ?? ""] }
    func insert(owner: String, endpoint: String, payload: String, digest: String) throws -> [String: Any] {
        let p = try object(Data(payload.utf8)); guard sha(payload) == digest, payload.count <= 45000, p["token"] == nil, let id = p["requestId"] as? String, id.range(of: "^[A-Za-z0-9-]{16,100}$", options: .regularExpression) != nil, let box = p["box"] as? String, !box.isEmpty, let machine = Int(p["machine"] as? String ?? ""), (1...111).contains(machine) else { throw failure("Invalid payload/digest") }
        lock.lock(); defer { lock.unlock() }; try execute("BEGIN IMMEDIATE"); do {
            if let old = try execute("SELECT * FROM queue WHERE id=?", [id]).first {
                guard old["owner"] as? String == owner, old["endpoint"] as? String == endpoint, old["payload"] as? String == payload else { throw failure("Request identity conflict") }; try execute("COMMIT"); return record(old)
            }
            try execute("INSERT INTO queue(id,owner,endpoint,payload,digest,state,created) VALUES(?,?,?,?,?,'LOCAL_SAVED',?)", [id,owner,endpoint,payload,digest,ISO8601DateFormatter().string(from: Date())]); try execute("COMMIT")
        } catch { try? execute("ROLLBACK"); throw error }
        guard let saved = try execute("SELECT * FROM queue WHERE id=?",[id]).first else { throw failure("Local read-back failed") }; return record(saved)
    }
    func list(_ owner: String, _ endpoint: String) throws -> [[String: Any]] { try execute("SELECT * FROM queue WHERE owner=? AND endpoint=? ORDER BY created LIMIT 10000", [owner,endpoint]).map(record) }
    func claim(_ session: [String: Any]) throws -> [[String: Any]] {
        let owner = session["owner"] as? String ?? "", endpoint = session["endpoint"] as? String ?? "", now = String(Int64(Date().timeIntervalSince1970 * 1000))
        lock.lock(); defer { lock.unlock() }; try execute("BEGIN IMMEDIATE"); do {
            let rows = try execute("SELECT * FROM queue WHERE owner=? AND endpoint=? AND state NOT IN ('PRODUCTION_CONFIRMED','REVIEW_REQUIRED') AND next<=? AND lease<=? ORDER BY created LIMIT 10", [owner,endpoint,now,now]).map(record)
            for row in rows { try execute("UPDATE queue SET state='UPLOADING',attempts=attempts+1,lease=? WHERE id=?",[String(Int64(now)! + 86400000),row["requestId"] as! String]) }; try execute("COMMIT"); return rows
        } catch { try? execute("ROLLBACK"); throw error }
    }
    func retry(_ row: [String: Any], _ reason: String) throws { let delay = min(3600.0,30 * pow(2,Double(min(row["attempts"] as? Int ?? 0,7)))); try execute("UPDATE queue SET state='RETRY_PENDING',lease=0,next=?,error=? WHERE id=? AND owner=? AND endpoint=?", [String(Int64((Date().timeIntervalSince1970 + delay) * 1000)),reason,row["requestId"] as! String,row["owner"] as! String,row["endpoint"] as! String]) }
    func apply(_ row: [String: Any], _ result: [String: Any]) throws {
        let p = try object(Data((row["payloadJson"] as! String).utf8)); for key in ["requestId","owner","digest"] { guard row[key] as? String == result[key] as? String else { throw failure("Receipt identity mismatch") } }
        guard p["box"] as? String == result["box"] as? String, p["machine"] as? String == result["machine"] as? String, let state = result["state"] as? String, ["CLOUD_RECEIVED","PRODUCTION_CONFIRMED","REVIEW_REQUIRED","RETRY_PENDING"].contains(state) else { throw failure("Invalid receipt") }
        let cloud = ["CLOUD_RECEIVED","PRODUCTION_CONFIRMED"].contains(state) ? ISO8601DateFormatter().string(from: Date()) : ""
        try execute("UPDATE queue SET state=?,lease=0,next=?,cloud=CASE WHEN cloud='' THEN ? ELSE cloud END,error=? WHERE id=? AND owner=? AND endpoint=?",[state,String(Int64((Date().timeIntervalSince1970+30)*1000)),cloud,result["errorCode"] as? String ?? "",row["requestId"] as! String,row["owner"] as! String,row["endpoint"] as! String])
    }
}

final class RC5Uploader: NSObject, URLSessionDataDelegate, URLSessionTaskDelegate {
    static let shared = RC5Uploader()
    static let identifier = "com.meera.rc5.upload"
    let queue = DispatchQueue(label: "com.meera.rc5.sync")
    private var buffers = [Int: Data]()
    private var preparing = false
    var completionHandler: (() -> Void)?
    lazy var session: URLSession = {
        let config = URLSessionConfiguration.background(withIdentifier: Self.identifier)
        config.sessionSendsLaunchEvents = true; config.isDiscretionary = false; config.waitsForConnectivity = true
        config.timeoutIntervalForResource = 7200
        let delegates = OperationQueue(); delegates.maxConcurrentOperationCount = 1
        return URLSession(configuration: config, delegate: self, delegateQueue: delegates)
    }()
    func foregroundRequest(_ endpoint: String, _ body: [String: Any]) async throws -> [String: Any] {
        guard validEndpoint(endpoint), let url = URL(string: endpoint) else { throw failure("Isolated Apps Script HTTPS endpoint required") }
        var request = URLRequest(url: url); request.httpMethod = "POST"; request.setValue("text/plain; charset=utf-8", forHTTPHeaderField: "Content-Type"); request.httpBody = try json(body); request.timeoutInterval = 60
        let (data,response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else { throw failure("Cloud HTTP failure") }; return try object(data)
    }
    func reconcile() {
        session.getAllTasks { tasks in self.queue.async {
            do { let live = Set(tasks.map { String($0.taskIdentifier) })
                for upload in try RC5Store.shared.execute("SELECT * FROM uploads") where !live.contains(upload["task"] as? String ?? "") { try self.finishLost(upload) }
                // A process can die after claiming but before recording the upload task.
                if tasks.isEmpty { try RC5Store.shared.execute("UPDATE queue SET lease=0,state='RETRY_PENDING' WHERE state='UPLOADING'") }
            } catch { /* SQLite remains the authority; no false confirmation. */ }
            self.pump()
        }}
    }
    private func finishLost(_ upload: [String: Any]) throws {
        if let raw = upload["rows"] as? String, let rows = try JSONSerialization.jsonObject(with: Data(raw.utf8)) as? [[String: Any]] { for row in rows { try RC5Store.shared.retry(row,"INTERRUPTED_TRANSFER") } }
        if let file = upload["file"] as? String { try? FileManager.default.removeItem(atPath: file) }
        try RC5Store.shared.execute("DELETE FROM uploads WHERE task=?",[upload["task"] as? String ?? ""])
    }
    func pump() {
        // One preparation at a time. OS manages the submitted background uploads.
        queue.async {
          guard !self.preparing else { return }
          guard ((try? RC5Store.shared.execute("SELECT * FROM uploads").count) ?? 0) < 3 else { return }
          self.preparing = true
          Task {
            var fillWindow = false
            defer { self.queue.async { self.preparing = false; if fillWindow { self.pump() } } }
            guard let snapshot = try? RC5Vault.shared.get(), let endpoint = snapshot["endpoint"] as? String, !endpoint.isEmpty else { return }
            var claimed = [[String: Any]]()
            do {
                claimed = try RC5Store.shared.claim(snapshot); if claimed.isEmpty { return }
                let authorization = try await self.foregroundRequest(endpoint,["action":"nativeAuthorize","owner":snapshot["owner"] ?? "","token":snapshot["token"] ?? "","entries":claimed])
                guard try RC5Vault.shared.current(snapshot) else { throw failure("ACCOUNT_CHANGED") }
                if authorization["errorCode"] as? String == "AUTH_REQUIRED" { try RC5Vault.shared.expire(snapshot); throw failure("AUTH_REQUIRED") }
                guard authorization["ok"] as? Bool == true, let ticket = authorization["ticket"] as? String else { throw failure("Upload authorization failed") }
                // Upload files contain an expiring, digest-bound upload ticket,
                // never the login/session token. Keychain retains credentials.
                let body: [String: Any] = ["action":"nativeBatch","protocol":1,"owner":snapshot["owner"] ?? "","ticket":ticket,"entries":claimed]
                let file = RC5Store.shared.directory.appendingPathComponent(UUID().uuidString + ".upload")
                try json(body).write(to:file,options:[.atomic,.completeFileProtectionUntilFirstUserAuthentication])
                var request = URLRequest(url:URL(string:endpoint)!); request.httpMethod="POST"; request.setValue("text/plain; charset=utf-8",forHTTPHeaderField:"Content-Type")
                let task = self.session.uploadTask(with:request,fromFile:file)
                try RC5Store.shared.execute("INSERT INTO uploads(task,epoch,owner,endpoint,file,rows) VALUES(?,?,?,?,?,?)",[String(task.taskIdentifier),snapshot["epoch"] as! String,snapshot["owner"] as! String,endpoint,file.path,String(data:try json(claimed),encoding:.utf8)!])
                guard try RC5Vault.shared.current(snapshot) else { task.cancel(); throw failure("ACCOUNT_CHANGED") }
                task.resume()
                // Fill a bounded window; later callbacks/foreground events resume.
                let active = try RC5Store.shared.execute("SELECT COUNT(*) AS n FROM uploads")
                if (Int(active.first?["n"] as? String ?? "0") ?? 0) < 3 { fillWindow = true }
            } catch { for row in claimed { try? RC5Store.shared.retry(row,"AUTH_OR_PREPARATION_FAILED") } }
        }}
    }
    func cancelAll() { session.getAllTasks { tasks in tasks.forEach { $0.cancel() } } }
    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) { var current = buffers[dataTask.taskIdentifier] ?? Data(); if current.count + data.count <= 2_000_000 { current.append(data) }; buffers[dataTask.taskIdentifier] = current }
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        let data = buffers.removeValue(forKey:task.taskIdentifier) ?? Data()
        queue.async {
            do {
                guard let upload = try RC5Store.shared.execute("SELECT * FROM uploads WHERE task=?",[String(task.taskIdentifier)]).first else { return }
                let rows = try JSONSerialization.jsonObject(with:Data((upload["rows"] as! String).utf8)) as! [[String: Any]]
                defer { try? RC5Store.shared.execute("DELETE FROM uploads WHERE task=?",[String(task.taskIdentifier)]); if let file=upload["file"] as? String { try? FileManager.default.removeItem(atPath:file) } }
                guard let active = try RC5Vault.shared.get(), active["epoch"] as? String == upload["epoch"] as? String else { for row in rows { try RC5Store.shared.retry(row,"ACCOUNT_CHANGED") }; return }
                guard error == nil, let response=task.response as? HTTPURLResponse, (200..<300).contains(response.statusCode), let result=try? object(data), result["ok"] as? Bool == true, let results=result["results"] as? [[String: Any]] else { for row in rows { try RC5Store.shared.retry(row,"NETWORK_OR_AUTH_REQUIRED") }; return }
                for row in rows { let matches=results.filter { $0["requestId"] as? String == row["requestId"] as? String }; do { guard matches.count == 1 else { throw failure("Missing/duplicate receipt") }; try RC5Store.shared.apply(row,matches[0]) } catch { try RC5Store.shared.retry(row,"UNVERIFIED_RECEIPT") } }
            } catch { /* Existing leases expire; full payload remains for recovery. */ }
            self.pump()
        }
    }
    func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
        queue.async { DispatchQueue.main.async { self.completionHandler?(); self.completionHandler=nil } }
    }
}

@objc(RC5QueuePlugin)
public class RC5QueuePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RC5QueuePlugin"
    public let jsName = "RC5Queue"
    public let pluginMethods: [CAPPluginMethod] = ["configure","setSession","getSession","clearSession","enqueue","list","sync","request"].map { CAPPluginMethod(name:$0,returnType:CAPPluginReturnPromise) }
    private let io = DispatchQueue(label:"com.meera.rc5.plugin")
    private var endpoint: String { UserDefaults.standard.string(forKey:"rc5-endpoint") ?? "" }
    private func perform(_ call: CAPPluginCall, _ work: @escaping () throws -> [String: Any]) { io.async { do { call.resolve(try work()) } catch { call.reject(error.localizedDescription) } } }
    @objc func configure(_ call: CAPPluginCall) { perform(call) { let url=call.getString("endpoint") ?? ""; guard validEndpoint(url) else { throw failure("Test HTTPS endpoint required") }; _ = try RC5Vault.shared.beginChange(); RC5Uploader.shared.cancelAll(); UserDefaults.standard.set(url,forKey:"rc5-endpoint");return ["ok":true] } }
    @objc func getSession(_ call: CAPPluginCall) { perform(call) { try RC5Vault.shared.get() ?? [:] } }
    @objc func clearSession(_ call: CAPPluginCall) { perform(call) { _ = try RC5Vault.shared.beginChange();RC5Uploader.shared.cancelAll();return ["ok":true] } }
    @objc func setSession(_ call: CAPPluginCall) {
        let token=call.getString("token") ?? "", endpoint=self.endpoint
        let revision: String
        do { revision=try RC5Vault.shared.beginChange();RC5Uploader.shared.cancelAll() } catch { call.reject(error.localizedDescription);return }
        Task { do {
            let user: [String: Any]
            if endpoint.isEmpty && token == "mock-only" { user=["username":"demo","machines":[1]] }
            else { let reply=try await RC5Uploader.shared.foregroundRequest(endpoint,["action":"nativeMe","token":token]);guard reply["ok"] as? Bool == true, let found=reply["user"] as? [String: Any] else { throw failure("Session validation failed") };user=found }
            guard let username=user["username"] as? String else { throw failure("User identity missing") }
            let snapshot: [String: Any]=["token":token,"owner":username.trimmingCharacters(in:.whitespacesAndNewlines).lowercased(),"user":user,"endpoint":endpoint,"epoch":UUID().uuidString]
            try RC5Vault.shared.completeChange(snapshot,revision:revision);RC5Uploader.shared.pump();call.resolve(snapshot)
        } catch { call.reject(error.localizedDescription) } }
    }
    @objc func enqueue(_ call: CAPPluginCall) { perform(call) { guard let s=try RC5Vault.shared.get() else { throw failure("Login required") };let row=try RC5Store.shared.insert(owner:s["owner"] as! String,endpoint:s["endpoint"] as! String,payload:call.getString("payloadJson") ?? "",digest:call.getString("digest") ?? "");RC5Uploader.shared.pump();return row } }
    @objc func list(_ call: CAPPluginCall) { perform(call) { guard let s=try RC5Vault.shared.get() else { return ["entries":[]] };return ["entries":try RC5Store.shared.list(s["owner"] as! String,s["endpoint"] as! String)] } }
    @objc func sync(_ call: CAPPluginCall) { RC5Uploader.shared.reconcile();call.resolve(["scheduled":true]) }
    @objc func request(_ call: CAPPluginCall) { let body=call.getObject("body") ?? [:];guard !(body["action"] as? String ?? "").hasPrefix("native") else { call.reject("Reserved native action");return };Task { do { call.resolve(try await RC5Uploader.shared.foregroundRequest(endpoint,["action":"nativeRpc","request":body])) } catch { call.reject(error.localizedDescription) } } }
}

class RC5ViewController: CAPBridgeViewController {
    override func capacitorDidLoad() { bridge?.registerPluginInstance(RC5QueuePlugin()) }
}
