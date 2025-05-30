import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Manage = () => {
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalCards: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}user-profile`);
      const data = response.data;
      setUsers(data.data);
      setStats(prev => ({ ...prev, totalUsers: data.data.length }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getCards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}taro-card`);
      const data = response.data;
      setCards(data.data);
      setStats(prev => ({ ...prev, totalCards: data.data.length }));
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleCardSubmit = async () => {
    
    const { value: formValues } = await Swal.fire({
      title: 'Add New Card',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Card Title">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Description">' +
        '<input id="swal-input3" class="swal2-input" placeholder="Image URL">',
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById('swal-input1').value;
        const description = document.getElementById('swal-input2').value;
        const imageUrl = document.getElementById('swal-input3').value;
        if (!title || !description || !imageUrl) {
          Swal.showValidationMessage('Please fill in all fields!');
          return false;
        }
        return { title, description, imageUrl };
      }
    });

    if (formValues) {
      try {
        await axios.post(`${API_BASE_URL}created-card`, {
          name: formValues.title,
          description: formValues.description,
          image: formValues.imageUrl
        });

        Swal.fire({
          icon: 'success',
          title: 'Card Added Successfully',
          showConfirmButton: false,
          timer: 1500
        });

        await getCards();
      } catch (error) {
        console.error('Error adding card:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add card.'
        });
      }
    }
  };

  const handleViewUserCards = async (userId) => {
    try {
      console.log("API_BASE_URL + user-card", `${API_BASE_URL}user-card`);
      console.log("user_id:", userId);
  
      const res = await axios.post(`${API_BASE_URL}user-card`, { user_id: userId });
  
      console.log("Response:", res.data);
  
      if (res.data && res.data.data && res.data.data.length > 0) {
        const cardsHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
            ${res.data.data.map(userCard => {
              if (!userCard.cards) return '';
              return `
                <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #fff; padding: 5px;">
                  <img src="${userCard.cards.image_url}" alt="${userCard.cards.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" />
                  <strong style="display: block; margin-top: 5px;">${userCard.cards.name}</strong>
                  <p style="margin: 4px 0; font-size: 12px; color: #555;">${userCard.cards.description}</p>
                </div>
              `;
            }).join('')}
          </div>
        `;
  
        Swal.fire({
          title: `User ID: ${userId}'s Cards`,
          html: `<div style="max-height: 500px; overflow-y: auto;">${cardsHTML}</div>`,
          width: 700,
          confirmButtonText: 'Close'
        });
      } else {
        Swal.fire({
          title: 'No Cards',
          text: `ไม่พบการ์ดสำหรับ User ID: ${userId}`,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      if (error.response) {
        console.error("API Error: ", error.response.status, error.response.data);
      } else {
        console.error("API Error (no response): ", error.message);
      }
      Swal.fire({
        title: 'Error',
        text: 'ไม่สามารถโหลดข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'Retry'
      });
    }
  };
  
  
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([getUsers(), getCards()]);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li>
              <button onClick={() => setActiveTab('dashboard')} className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                <span className="ms-3">Dashboard</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('cards')} className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                <span className="ms-3">Card</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('users')} className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                <span className="ms-3">Users</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-dashed rounded-lg dark:border-gray-700">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="p-6 bg-white rounded-lg shadow text-center">
                    <h3 className="text-lg font-medium text-gray-600">Total Users</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg shadow text-center">
                    <h3 className="text-lg font-medium text-gray-600">Total Cards</h3>
                    <p className="text-3xl font-bold">{stats.totalCards}</p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">User Profiles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <div key={index} className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-xl transition">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{user.name}</h3>
                          <p className="text-gray-600 text-sm mb-1">{user.email}</p>
                          <p className="text-gray-500 text-sm">{user.phone}</p>
                          <button
                            onClick={() => handleViewUserCards(user.user_id)}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                          >
                            View UserCard
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No users found.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'cards' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Cards</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cards.length > 0 ? (
                      cards.map((card, index) => (
                        <div key={index} className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                          <img src={card.image_url} alt={card.title} className="w-full h-48 object-cover rounded mb-3" />
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">{card.title}</h3>
                          <p className="text-sm text-gray-600">{card.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No cards found.</p>
                    )}
                  </div>
                  <button
                    onClick={handleCardSubmit}
                    className="relative inline-flex items-center justify-center p-0.5 m-2 mt-6 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                  >
                    <span className="relative px-6 py-3 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                      ADD CARD
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Manage;
