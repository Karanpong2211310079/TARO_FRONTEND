import React, { use } from 'react';
import { useState } from 'react';
import axios from 'axios';



const User = () => {
    const [user, setUser] = useState([]);
    const ShowUser = async () => {
        try{
            const res = await axios.get('http://localhost:3000/user-profile');
            setUser(res.data);
            
        }catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    useEffect(() => {
        ShowUser();
    }, []);
  return (
    <div className=''>
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm ">
      <div className="flex flex-col items-center pb-10 mt-5">
        <img
          className="w-24 h-24 mb-3 rounded-full shadow-lg"
          src="https://i.pravatar.cc/100" // คุณสามารถเปลี่ยน URL ภาพได้ตามต้องการ
          alt="Bonnie Green"
        />
        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
          Bonnie Green
        </h5>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Visual Designer
        </span>
      </div>
    </div>
    </div>
  );
};

export default User;
