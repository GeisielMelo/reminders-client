import React, { useState, useEffect, createContext } from 'react'
import lodash from 'lodash'
import { createRepository, fetchRepository, updateRepository, signOut } from '../services/api'
import { useNavigate } from 'react-router-dom'

export const NotesContext = createContext()

export const NotesProvider = ({ children }) => {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [labels, setLabels] = useState([])
  const [notes, setNotes] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const disconnect = async () => {
      try {
        await signOut()
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        api.defaults.headers.common.Authorization = null
        navigate('/')
      } catch (error) {
        console.error()
      }
    }

    const fetchData = async () => {
      const user = localStorage.getItem('user')
      if (!user) {
        return
      }

      try {
        setSyncing(true)
        const response = await fetchRepository(JSON.parse(user))
        setData(response.data)
        setNotes(response.data.notes)
        setLabels(response.data.labels)
      } catch (error) {
        if (error.response.status === 401) {
          disconnect()
        }
        if (error.response.status === 404) {
          const response = await createRepository(JSON.parse(user))
          setData(response.data)
        } else {
          console.log(error)
          console.error('Internal server error.')
        }
      } finally {
        setSyncing(false)
      }
    }

    const syncData = async () => {
      try {
        setSyncing(true)
        if (!lodash.isEqual(notes, data.notes) || !lodash.isEqual(labels, data.labels)) {
          const user = localStorage.getItem('user')
          if (!user) {
            return
          } else {
            await updateRepository(JSON.parse(user), notes, labels)
          }
        }
      } catch (error) {
        if (error.response.status === 401) {
          disconnect()
        }
      } finally {
        setSyncing(false)
      }
    }

    if (!data) {
      fetchData()
    }

    if (notes.length > 0 || labels.length > 0) {
      syncData()
    }
  }, [data, notes, labels])

  const addLabel = (label) => {
    setLabels((prevLabels) => [...prevLabels, label])
  }

  const removeLabel = async (label) => {
    const user = localStorage.getItem('user')
    const newLabels = labels.filter((l) => l !== label)
    const newNotes = notes.map((note) => {
      if (note.labels.includes(label)) {
        note.labels = note.labels.filter((l) => l !== label)
      }
      return note
    })

    setLabels((prevLabels) => prevLabels.filter((l) => l !== label))
    await updateRepository(JSON.parse(user), newNotes, newLabels)
  }

  const addNote = (title, description, labels = [], archived = false) => {
    setNotes((prevNotes) => [...prevNotes, { title, description, labels, archived }])
  }

  const removeNote = (index) => {
    setNotes((prevNotes) => prevNotes.filter((note, i) => i !== index))
  }

  const updateNote = (index, title, description, labels, archived = false) => {
    setNotes((prevNotes) => {
      return prevNotes.map((note, i) => {
        if (i === index) {
          return {
            title: title,
            description: description,
            labels: labels,
            archived: archived,
          }
        } else {
          return note
        }
      })
    })
  }

  const contextData = {
    notes,
    labels,
    search,
    syncing,
    addLabel,
    removeLabel,
    addNote,
    removeNote,
    updateNote,
    setSearch,
  }

  return <NotesContext.Provider value={contextData}>{children}</NotesContext.Provider>
}
