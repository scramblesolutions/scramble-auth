"use client"

import React from 'react'
import useOAuth from '../hooks/useOAuth';
import Image from 'next/image';
import Logo from '../images/logo.svg';
import { useRouter } from 'next/navigation';

const formatBase64Image = (base64String: string, mimeType = 'image/png') => {
  return `data:${mimeType};base64,${base64String}`;
}

const UserInfoPage = () => {

  const router = useRouter();

  const { state, userInfo, logout } = useOAuth();

  if (state !== 'completed') {
    return (
      <div>
        <h1>User Info</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div>
        <h1>User Info</h1>
        <p>Error fetching user info</p>
      </div>
    )
  }


  return (
    <div className='w-full flex justify-center flex-col items-center'>
      <Image src={Logo} alt='Next.js logo' width={180} height={38} priority className='my-5 cursor-pointer' onClick={()=>{
        router.push('/')
      }}/>
        <div className='my-10 rounded-full overflow-hidden shadow-'> 
          {userInfo.picture && <Image src={formatBase64Image(userInfo.picture)} alt='Profile Image' width={300} height={300} />}
        </div>
      <div className='max-w-sm w-full'>
        <div className='flex items-center justify-between'>
        <h1>Status: {state === 'completed' && <span className='text-green-500 '>Authenticated</span>}
        </h1>
        <button className='bg-primary text-background rounded-full px-4 py-2' onClick={logout}>Logout</button>
        </div>
        <p className='mt-4'>
          First Name: {userInfo.given_name}
        </p>
        <p>
          Last Name: {userInfo.family_name}
        </p>
        <p>
          Email: {userInfo.email}
        </p>
        <p>
          Bio: {userInfo.profile}
        </p>

      </div>
    </div>
  )
}

export default UserInfoPage