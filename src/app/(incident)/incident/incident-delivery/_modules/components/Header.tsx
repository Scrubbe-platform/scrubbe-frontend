import SideModal from '@/components/ui/SideModal'
import { usePathname } from 'next/navigation'
import React, { ReactNode, useState } from 'react'
import { AiOutlineBranches } from 'react-icons/ai'
import { GoShieldCheck } from 'react-icons/go'
import { IoBookOutline, IoDocumentOutline, IoDocumentTextOutline } from 'react-icons/io5'
import Govern from './Modal/Govern'
import Playbook from './Modal/Playbook'
import AnalystNote from './Modal/AnalystNote'

const Header = () => {
    const [isGoverned, setIsGoverned] = useState(false)
    const [isAnalystNote, setIsAnalystNote] = useState(false)
    const [isPlaybook, setIsPlaybook] = useState(false)
    const pathname = usePathname()
    const tags = [
        {
            "title": "Governed",
            Icon: <GoShieldCheck className='size-4 text-emerald-400' />,
            onClick: () => { setIsGoverned(true) }
        },
        {
            "title": "Source : PR & CI",
            Icon: <AiOutlineBranches className='size-4 text-orange-400' />,
            onClick: () => { }
        },
        {
            "title": "Playbook Active",
            Icon: <IoBookOutline className='size-4 text-fuchsia-500' />,
            onClick: () => setIsPlaybook(true)
        },
        {
            "title": "Decision Log",
            Icon: <IoDocumentTextOutline className='size-4 text-blue-500' />,
            onClick: () => { }
        },
        {
            "title": "Analyst Note",
            Icon: <IoDocumentOutline className='size-4 text-yellow-500' />,
            onClick: () => setIsAnalystNote(true)
        },
    ]
    return (
        <div>
            <div className='flex justify-between items-start text-white'>
                <div className='space-y-3'>
                    <p className='text-lg font-semibold '>Scrubbe • Analyst Investigation</p>
                    <p className=' font-semibold'>Delivery incident — CI/CD & PR failure investigation</p>
                    <p className='text-base max-w-xl'>
                        Analyst view for “what went wrong” across CI/CD, PRs, commits, and artifacts: Timeline → Evidence → Hypotheses → Remediation → Verification → Decision Log.
                    </p>
                </div>
                <div className='flex items-center gap-4 max-w-2xl flex-wrap'>
                    {
                        tags.map(({ Icon, title, onClick }) => (
                            <ButtonTags Icon={Icon} title={title} onClick={onClick} key={title}/>
                        ))
                    }
                </div>
            </div>

            {isGoverned &&
                <SideModal isOpen={isGoverned} onClose={() => setIsGoverned(false)} title={'Governed orchestration'} subTitle='What “Governed” means'>
                    <Govern />
                </SideModal>
            }
            {isPlaybook &&
                <SideModal isOpen={isPlaybook} onClose={() => setIsPlaybook(false)} title={'Playbook'} subTitle='Active playbook'>
                    <Playbook />
                </SideModal>
            }

            {isAnalystNote &&
                <SideModal isOpen={isAnalystNote} onClose={() => setIsAnalystNote(false)} title={'Analyst Note'} subTitle='Add note (author + timestamp)'>
                    <AnalystNote />
                </SideModal>
            }
        </div>
    )
}

const ButtonTags = ({ Icon, title, onClick }: { Icon: ReactNode, title: string, onClick: () => void }) => {
    return (
        <div onClick={onClick} className='cursor-pointer border border-zinc-400 rounded-xl flex items-center gap-2 text-sm px-2 py-1'>
            {Icon}
            {title}
        </div>
    )
}

export default Header