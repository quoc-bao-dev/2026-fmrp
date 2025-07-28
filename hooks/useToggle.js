import { useState } from 'react'

export const useToggle = (initialValue = false) => {
  const [isOpen, sIsOpen] = useState(initialValue)

  const [isId, sIsId] = useState(null)

  const [isIdChild, sIsIdChild] = useState(null)

  const [isKeyState, sIsKeyState] = useState(null)

  const handleToggle = () => sIsOpen((prev) => !prev)

  const handleOpen = (e) => sIsOpen(e)

  const handleQueryId = ({ id, status, idChild, initialKey }) => {
    sIsId(id)
    sIsOpen(status)

    //idChild, initialKey biến này truyền gì vào cũng được
    sIsIdChild(idChild)
    sIsKeyState(initialKey)
  }

  return { isOpen, isId, isIdChild, isKeyState, handleOpen, handleToggle, handleQueryId }
}
