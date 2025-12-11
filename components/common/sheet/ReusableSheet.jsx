'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useSheet } from '@/context/ui/SheetContext'

export default function ReusableSheet(props) {
    const { isOpen, sheetData } = useSheet()

    return (
        <AnimatePresence>
            {isOpen && sheetData && (
                <motion.div
                    className={`fixed z-[100] bg-white shadow-lg ${sheetData.className || 'w-[400px]'}`}
                    style={{
                        top: '72px',
                        bottom: '0px',
                        height: 'calc(100vh - 72px)',
                        [sheetData.position || 'right']: '0px',
                    }}
                    initial={{ x: sheetData.position === 'left' ? '-100%' : '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: sheetData.position === 'left' ? '-100%' : '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <div className="w-full h-full">
                        {sheetData.content}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
