import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Notes from './notes'


function playAudio(url: string) {
  const audio = new Audio(url);
  console.log('url', url)
  audio.play().catch(err => {
    console.error("播放失败:", err);
  });
}

function App() {
  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      const item = Notes.find(i => +i.keyCode === e.keyCode)
      console.log(item, e.keyCode)
      if (item)
        playAudio(item?.url)
    })
  }, [])
  return <div></div>
}

export default App
