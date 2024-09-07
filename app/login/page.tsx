"use client"

import React from 'react'
import Image from 'next/image'
import Logo from '../images/logo.svg'
import { FaArrowLeft } from "react-icons/fa6";
// import { login } from '../apis/authAPIs';
import useOAuth from '../hooks/useOAuth';
import { useRouter } from 'next/navigation';

interface LoginProps {
  data: string
}

const LoginPage: React.FC<LoginProps> = ({ }) => {

  const router = useRouter()
  const { state, error, userInfo, login } = useOAuth();

  return (
    <div className='flex w-full flex-col max-w-md m-auto gap-3 '>
      <button className='text-primary/50 hover:text-primary/100 font-bold py-2 rounded flex gap-2 items-center group'
        onClick={() => router.back()}
      >
        <FaArrowLeft className='group-hover:-translate-x-1 transition-all' />
        Back
      </button>
      <div className='flex flex-col gap-3'>
        <Image src={Logo} alt='Next.js logo' width={180} height={38} priority className='my-5' />
        {
          state === 'error' && <p className='text-red-500'>An error occured. Please try again later</p>
        }
        {
          state === 'completed' &&
          <div className='flex items-center justify-between'>
            <p>
              Status:
              <span className='text-green-500'> Authenticated</span>
            </p>
            <div className='flex gap-2'>
            <button className='bg-primary text-background rounded-full px-4 py-2' onClick={()=>{
              router.push('/user')}}>Profile</button>
            <button className='bg-primary text-background rounded-full px-4 py-2' onClick={login}>Logout</button>
            </div>
          </div>
        }
        {
          userInfo && <h4 className='font-medium text-xl'>
            Welcome, {userInfo.nickname}
          </h4>
        }
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            We are excited to have you onboard.
          </li>
          <li className="mb-2">We respect your privacy and are committed to protecting your personal information.</li>
          <li className="mb-2">A frcitionless encrypted sso.</li>
        </ol>
        <div className='my-5 '>
          {
            state == 'idle' && <div>

              <p className='text-primary mb-3'>Click the button below to </p>
              <button className='rounded-full border border-solid border-transparent flex items-center justify-center  bg-primary text-background gap-2 hover:brightness-90 h-10 sm:h-12 px-4 sm:px-5 transition-all w-[160px] text-medium' onClick={login}>
                Login with SSO
              </button>
            </div>
          }

        </div>
        {error && <p className='text-red-500'>{error}</p>}
      </div>
    </div>
  )
}

export default LoginPage
