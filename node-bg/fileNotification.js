const WebSocket = require('ws');

/**
 * 大文件实时通知 WebSocket 服务
 * 
 * 功能：
 * - 监听大文件上传/处理进度
 * - 实时推送进度通知给客户端
 * - 支持多个客户端同时连接
 */
class FileNotificationService {
    constructor(server) {
        // WebSocket 服务器实例
        this.wssServer = null;
        // 存储所有连接的客户端
        this.clients = new Map();
        // 存储文件上传任务信息
        this.fileTasks = new Map();
    }

    /**
     * 初始化 WebSocket 服务器
     * @param {http.Server} server HTTP 服务器实例
     */
    init(server) {
        // 创建 WebSocket 服务器，附加到 HTTP 服务器上
        this.wssServer = new WebSocket.Server({ 
            server: server,
            path: '/ws/file-notification' // WebSocket 连接路径
        });

        // 监听客户端连接
        this.wssServer.on('connection', (ws, req) => {
            console.log('[WebSocket] 新客户端连接');
            
            // 生成客户端ID
            const clientId = this.generateClientId();
            // 存储客户端连接
            this.clients.set(clientId, {
                ws: ws,
                id: clientId,
                connectTime: new Date(),
                fileTasks: new Set() // 该客户端关联的文件任务
            });

            // 监听客户端消息
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleClientMessage(clientId, message);
                } catch (error) {
                    console.error('[WebSocket] 消息解析失败:', error.message);
                    this.sendError(clientId, '消息格式错误');
                }
            });

            // 监听客户端断开连接
            ws.on('close', () => {
                console.log(`[WebSocket] 客户端 ${clientId} 断开连接`);
                this.removeClient(clientId);
            });

            // 监听错误
            ws.on('error', (error) => {
                console.error(`[WebSocket] 客户端 ${clientId} 错误:`, error);
            });

            // 发送连接成功消息
            this.sendMessage(clientId, {
                type: 'connected',
                clientId: clientId,
                message: '连接成功'
            });
        });

        console.log('[WebSocket] 文件通知服务已启动，路径: /ws/file-notification');
    }

    /**
     * 生成客户端ID
     * @returns {string} 客户端唯一标识
     */
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * 处理客户端消息
     * @param {string} clientId 客户端ID
     * @param {object} message 消息对象
     */
    handleClientMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) {
            return this.sendError(clientId, '客户端不存在');
        }

        switch (message.type) {
            case 'subscribe':
                // 订阅文件任务通知
                this.subscribeFileTask(clientId, message.fileId);
                break;
            case 'unsubscribe':
                // 取消订阅文件任务通知
                this.unsubscribeFileTask(clientId, message.fileId);
                break;
            case 'ping':
                // 心跳检测
                this.sendMessage(clientId, { type: 'pong' });
                break;
            default:
                this.sendError(clientId, `未知的消息类型: ${message.type}`);
        }
    }

    /**
     * 订阅文件任务通知
     * @param {string} clientId 客户端ID
     * @param {string} fileId 文件ID
     */
    subscribeFileTask(clientId, fileId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        // 添加到客户端的任务列表
        client.fileTasks.add(fileId);

        // 如果文件任务已存在，立即发送当前状态
        const task = this.fileTasks.get(fileId);
        if (task) {
            this.sendMessage(clientId, {
                type: 'progress',
                fileId: fileId,
                progress: task.progress,
                chunkIndex: task.chunkIndex,
                totalChunks: task.totalChunks,
                status: task.status
            });
        } else {
            // 创建新任务（如果不存在）
            this.fileTasks.set(fileId, {
                fileId: fileId,
                progress: 0,
                chunkIndex: 0,
                totalChunks: 0,
                status: 'pending' // pending | uploading | merging | complete | error
            });
        }

        console.log(`[WebSocket] 客户端 ${clientId} 订阅文件任务 ${fileId}`);
    }

    /**
     * 取消订阅文件任务通知
     * @param {string} clientId 客户端ID
     * @param {string} fileId 文件ID
     */
    unsubscribeFileTask(clientId, fileId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        client.fileTasks.delete(fileId);
        console.log(`[WebSocket] 客户端 ${clientId} 取消订阅文件任务 ${fileId}`);
    }

    /**
     * 更新文件上传进度
     * @param {string} fileId 文件ID
     * @param {number} progress 进度百分比 (0-100)
     * @param {number} chunkIndex 当前分片索引
     * @param {number} totalChunks 总分片数
     * @param {string} status 任务状态
     */
    updateFileProgress(fileId, progress, chunkIndex, totalChunks, status = 'uploading') {
        // 更新任务信息
        const task = this.fileTasks.get(fileId) || {
            fileId: fileId,
            progress: 0,
            chunkIndex: 0,
            totalChunks: 0,
            status: 'pending'
        };

        task.progress = progress;
        task.chunkIndex = chunkIndex;
        task.totalChunks = totalChunks;
        task.status = status;
        task.lastUpdate = new Date();

        this.fileTasks.set(fileId, task);

        // 通知所有订阅了该文件的客户端
        this.broadcastToSubscribers(fileId, {
            type: 'progress',
            fileId: fileId,
            progress: progress,
            chunkIndex: chunkIndex,
            totalChunks: totalChunks,
            status: status
        });

        console.log(`[WebSocket] 文件 ${fileId} 进度更新: ${progress}% (${chunkIndex}/${totalChunks})`);
    }

    /**
     * 通知文件分片上传完成
     * @param {string} fileId 文件ID
     * @param {number} chunkIndex 分片索引
     */
    notifyChunkUploaded(fileId, chunkIndex) {
        this.broadcastToSubscribers(fileId, {
            type: 'chunkUploaded',
            fileId: fileId,
            chunkIndex: chunkIndex
        });
    }

    /**
     * 通知文件合并完成
     * @param {string} fileId 文件ID
     */
    notifyMergeComplete(fileId) {
        const task = this.fileTasks.get(fileId);
        if (task) {
            task.status = 'complete';
            task.progress = 100;
        }

        this.broadcastToSubscribers(fileId, {
            type: 'mergeComplete',
            fileId: fileId
        });

        console.log(`[WebSocket] 文件 ${fileId} 合并完成`);
    }

    /**
     * 通知文件处理错误
     * @param {string} fileId 文件ID
     * @param {string} error 错误信息
     */
    notifyError(fileId, error) {
        const task = this.fileTasks.get(fileId);
        if (task) {
            task.status = 'error';
        }

        this.broadcastToSubscribers(fileId, {
            type: 'error',
            fileId: fileId,
            error: error
        });

        console.error(`[WebSocket] 文件 ${fileId} 处理错误: ${error}`);
    }

    /**
     * 广播消息给所有订阅了该文件的客户端
     * @param {string} fileId 文件ID
     * @param {object} message 消息对象
     */
    broadcastToSubscribers(fileId, message) {
        let count = 0;
        this.clients.forEach((client, clientId) => {
            if (client.fileTasks.has(fileId)) {
                this.sendMessage(clientId, message);
                count++;
            }
        });
        
        if (count > 0) {
            console.log(`[WebSocket] 已通知 ${count} 个客户端关于文件 ${fileId}`);
        }
    }

    /**
     * 发送消息给指定客户端
     * @param {string} clientId 客户端ID
     * @param {object} message 消息对象
     */
    sendMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        const ws = client.ws;
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error(`[WebSocket] 发送消息失败 (${clientId}):`, error);
                // 连接可能已断开，移除客户端
                this.removeClient(clientId);
            }
        }
    }

    /**
     * 发送错误消息
     * @param {string} clientId 客户端ID
     * @param {string} error 错误信息
     */
    sendError(clientId, error) {
        this.sendMessage(clientId, {
            type: 'error',
            error: error
        });
    }

    /**
     * 移除客户端
     * @param {string} clientId 客户端ID
     */
    removeClient(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            // 关闭 WebSocket 连接
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.close();
            }
            // 从客户端列表中移除
            this.clients.delete(clientId);
            console.log(`[WebSocket] 已移除客户端 ${clientId}`);
        }
    }

    /**
     * 获取当前连接数
     * @returns {number} 连接数
     */
    getClientCount() {
        return this.clients.size;
    }

    /**
     * 获取文件任务信息
     * @param {string} fileId 文件ID
     * @returns {object|null} 任务信息
     */
    getFileTask(fileId) {
        return this.fileTasks.get(fileId) || null;
    }

    /**
     * 关闭 WebSocket 服务器
     */
    close() {
        // 关闭所有客户端连接
        this.clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.close();
            }
        });
        this.clients.clear();

        // 关闭服务器
        if (this.wssServer) {
            this.wssServer.close();
            this.wssServer = null;
        }

        console.log('[WebSocket] 文件通知服务已关闭');
    }
}

// 创建单例
const fileNotificationService = new FileNotificationService();

module.exports = fileNotificationService;