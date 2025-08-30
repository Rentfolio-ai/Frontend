'use client'

import CivitasInterface from '../ai/CivitasInterface'

interface DashboardWithChatProps {
  isCollapsed?: boolean;
}

function DashboardWithChat({ isCollapsed = false }: DashboardWithChatProps) {
  return <CivitasInterface isCollapsed={isCollapsed} />
}

DashboardWithChat.displayName = 'DashboardWithChat'

export default DashboardWithChat
