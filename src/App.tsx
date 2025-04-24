import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

// 从环境变量中获取Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

// 定义消息类型
interface Message {
  id: number
  content: string
  created_at: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 加载所有消息
  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      setMessages(data || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError('获取消息失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // 添加新消息
  const addMessage = async () => {
    if (!newMessage.trim()) return
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ content: newMessage.trim() }])
      
      if (error) {
        throw error
      }
      
      setNewMessage('')
      fetchMessages() // 重新加载消息列表
    } catch (err: any) {
      console.error('Error adding message:', err)
      setError('添加消息失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // 初始加载
  useEffect(() => {
    fetchMessages()
    
    // 订阅实时更新
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        console.log('实时更新:', payload)
        fetchMessages()
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return (
    <div className="container">
      <h1>Cloudflare Pages + Supabase 演示</h1>
      <p>这是一个简单的演示，展示了如何连接 Cloudflare Pages 和 Supabase。</p>
      
      <div className="card">
        <div className="form-group">
          <h2>添加新消息</h2>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入新消息..."
            disabled={loading}
          />
          <button onClick={addMessage} disabled={loading || !newMessage.trim()}>
            {loading ? '添加中...' : '添加消息'}
          </button>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div>
          <h2>消息列表</h2>
          <button onClick={fetchMessages} disabled={loading}>
            {loading ? '刷新中...' : '刷新消息'}
          </button>
          
          <div className="data-display">
            {messages.length === 0 ? (
              <p>暂无消息</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="message-item">
                  <p>{message.content}</p>
                  <small>
                    {new Date(message.created_at).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 