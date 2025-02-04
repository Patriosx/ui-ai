"use client"
import { useState, useRef, useEffect } from "react"
import { FiSend, FiCopy, FiCheck, FiTrash2, FiMessageSquare, FiEdit2 } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { format } from "date-fns"

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
  isCode: boolean
}

const MessageBubble = ({ message, isUser }: { message: Message; isUser: boolean }) => {
  const [copied, setCopied] = useState(false)
  const copyToClipboard = (text: string) => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-4 ${isUser ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-700 rounded-bl-none"}`}>
        <div className='flex items-start justify-between gap-4'>
          <p className='text-sm whitespace-pre-wrap break-words'>{message.text}</p>
          {message.isCode && (
            <button
              onClick={() => copyToClipboard(message.text)}
              className='text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors'
              aria-label={copied ? "Copied!" : "Copy code"}
            >
              {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
            </button>
          )}
        </div>
        <div className='mt-2 text-xs opacity-70'>{format(new Date(message.timestamp), "HH:mm")}</div>
      </div>
    </div>
  )
}

const MessageList = ({ messages }) => {
  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  return (
    <div ref={scrollRef} className='flex-1 overflow-y-auto p-4 space-y-4' style={{ scrollBehavior: "smooth" }}>
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} isUser={message.isUser} />
      ))}
    </div>
  )
}

const Sidebar = ({ conversations, activeConversation, onSelectConversation, onDeleteConversation, onNewChat, onRenameConversation }) => {
  return (
    <div className='w-64 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 p-4 overflow-y-auto'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Conversation History</h2>
        <button onClick={onNewChat} className='p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors' aria-label='New Chat'>
          + New Chat
        </button>
      </div>
      <div className='space-y-2'>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`group p-3 rounded-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
              activeConversation?.id === conversation.id
                ? "bg-blue-500 text-white shadow-md"
                : "hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <FiMessageSquare className='flex-shrink-0' size={16} />
                <span className='truncate font-medium'>{conversation.title || "New Chat"}</span>
              </div>
              <div className='opacity-0 group-hover:opacity-100 flex gap-2 ml-2 flex-shrink-0'>
                {conversation.title && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRenameConversation(conversation.id)
                    }}
                    className='hover:text-yellow-500 transition-all'
                    aria-label='Rename conversation'
                  >
                    <FiEdit2 size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conversation.id)
                  }}
                  className='hover:text-red-500 transition-all'
                  aria-label='Delete conversation'
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
            <div className='text-xs mt-1 opacity-70'>{format(new Date(conversation.timestamp), "MMM d, yyyy")}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const InputArea = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("")
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  return (
    <form onSubmit={handleSubmit} className='p-4 border-t dark:border-gray-700'>
      <div className='flex items-end gap-2'>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Ask me anything...'
          className='flex-1 resize-vertical min-h-[44px] max-h-[200px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white'
          rows={1}
          aria-label='Message input'
        />
        <button
          type='submit'
          disabled={isLoading || !message.trim()}
          className='p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          aria-label='Send message'
        >
          {isLoading ? <AiOutlineLoading3Quarters className='animate-spin' size={20} /> : <FiSend size={20} />}
        </button>
      </div>
    </form>
  )
}

const SaveButton = ({ onSave, className }) => (
  <button
    onClick={onSave}
    className={`flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${className}`}
    aria-label='Save conversation'
  >
    <FiCheck size={16} />
    <span>Save Chat</span>
  </button>
)

const ChatInterface = () => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("conversations")
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "default",
            title: "First Conversation",
            messages: [
              {
                text: "Hello! How can I help you today?",
                isUser: false,
                timestamp: new Date(),
              },
            ],
            timestamp: new Date(),
          },
        ]
  })

  const [activeConversation, setActiveConversation] = useState(conversations[0])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations))
  }, [conversations])

  const handleNewChat = () => {
    if (activeConversation.messages.length > 1 && !activeConversation.title) {
      if (window.confirm("Would you like to save the current conversation before starting a new one?")) {
        handleSaveConversation()
        return
      }
    }

    const newConversation = {
      id: Date.now().toString(),
      messages: [
        {
          text: "Hello! How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        },
      ],
      timestamp: new Date(),
    }

    setConversations((prev) => [...prev, newConversation])
    setActiveConversation(newConversation)
  }

  const handleSelectConversation = (conversation) => {
    if (activeConversation.messages.length > 1 && !activeConversation.title) {
      if (window.confirm("Would you like to save the current conversation before switching?")) {
        handleSaveConversation()
        return
      }
    }
    setActiveConversation(conversation)
  }

  const handleSaveConversation = () => {
    const title = prompt("Enter a title for this conversation:")
    if (title) {
      const newConversation = {
        ...activeConversation,
        title: title,
        id: Date.now().toString(),
        timestamp: new Date(),
      }
      setConversations((prev) => [...prev, newConversation])
      setActiveConversation(newConversation)
    }
  }

  const handleSendMessage = async (text) => {
    const userMessage = {
      text,
      isUser: true,
      timestamp: new Date(),
    }

    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage],
    }

    updateConversation(updatedConversation)
    await simulateAIResponse(text, updatedConversation)
  }

  const simulateAIResponse = async (userMessage, conversation) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const aiResponse = {
        text: `I received your message: "${userMessage}". This is a simulated AI response.`,
        isUser: false,
        timestamp: new Date(),
      }

      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, aiResponse],
      }

      updateConversation(updatedConversation)
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = {
        text: "Sorry, there was an error processing your request.",
        isUser: false,
        timestamp: new Date(),
        isError: true,
      }

      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, errorMessage],
      }

      updateConversation(updatedConversation)
    } finally {
      setIsLoading(false)
    }
  }

  const updateConversation = (updatedConversation) => {
    setActiveConversation(updatedConversation)
    setConversations((prev) => prev.map((conv) => (conv.id === updatedConversation.id ? updatedConversation : conv)))
  }

  const handleRenameConversation = (id) => {
    const conversation = conversations.find((conv) => conv.id === id)
    const newTitle = prompt("Enter new title for this conversation:", conversation.title)
    if (newTitle && newTitle !== conversation.title) {
      const updatedConversation = {
        ...conversation,
        title: newTitle,
        timestamp: new Date(),
      }
      setConversations((prev) => prev.map((conv) => (conv.id === id ? updatedConversation : conv)))
      if (activeConversation.id === id) {
        setActiveConversation(updatedConversation)
      }
    }
  }

  return (
    <div className='flex h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={(id) => {
          setConversations((prev) => prev.filter((conv) => conv.id !== id))
          if (activeConversation.id === id) {
            setActiveConversation(conversations[0])
          }
        }}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
      />
      <div className='flex-1 flex flex-col'>
        <div className='flex-1 max-w-4xl w-full mx-auto flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden'>
          <div className='p-4 border-b dark:border-gray-700 flex justify-end'>
            <SaveButton onSave={handleSaveConversation} />
          </div>
          <MessageList messages={activeConversation.messages} />
          <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
