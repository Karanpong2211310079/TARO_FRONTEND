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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}user-profile`);
      console.log('User data:', response.data.data); // Debug: ตรวจสอบโครงสร้างข้อมูล
      const userData = response.data.data;
      setUsers(userData);
      setStats(prev => ({ ...prev, totalUsers: userData.length }));
      userData.forEach(user => {
        if (!user.phone_number) {
          console.warn(`User ${user.name} (ID: ${user.user_id}) has no phone_number field`);
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
  };

  const getCards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}taro-card`);
      setCards(response.data.data);
      setStats(prev => ({ ...prev, totalCards: response.data.data.length }));
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('ไม่สามารถโหลดข้อมูลการ์ดได้');
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

  const handleDeleteUserCard = async (userId, cardId) => {
    console.log('Attempting to delete card:', { userId, cardId }); // Debug
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ว่าต้องการลบการ์ดนี้?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (result.isConfirmed) {
      try {
        // ลองใช้ POST ก่อน
        const response = await axios.post(`${API_BASE_URL}delete-user-card`, { user_id: userId, card_id: cardId });
        console.log('Delete response:', response.data); // Debug
        Swal.fire({
          icon: 'success',
          title: 'ลบการ์ดสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        });
        // รีเฟรชข้อมูลการ์ดของผู้ใช้
        handleViewUserCards(userId);
      } catch (error) {
        console.error('Error deleting card:', error.response?.status, error.response?.data || error.message);
        // ลองใช้ DELETE หาก POST ไม่ทำงาน
        try {
          const response = await axios.delete(`${API_BASE_URL}delete-user-card`, { data: { user_id: userId, card_id: cardId } });
          console.log('Delete response (DELETE):', response.data); // Debug
          Swal.fire({
            icon: 'success',
            title: 'ลบการ์ดสำเร็จ',
            showConfirmButton: false,
            timer: 1500
          });
          handleViewUserCards(userId);
        } catch (deleteError) {
          console.error('Error deleting card (DELETE):', deleteError.response?.status, deleteError.response?.data || deleteError.message);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'ไม่สามารถลบการ์ดได้: ' + (deleteError.response?.data?.message || deleteError.message)
          });
        }
      }
    }
  };

  const handleViewUserCards = async (userId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}user-card`, { user_id: userId });
      console.log('User cards data:', res.data.data); // Debug
      if (res.data && res.data.data && res.data.data.length > 0) {
        const cardsHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px;">
            ${res.data.data.map(userCard => {
          if (!userCard.cards) {
            console.warn('No cards data for userCard:', userCard); // Debug
            return '';
          }
          if (!userCard.cards.id) {
            console.warn('No card ID for card:', userCard.cards); // Debug
          }
          return `
                <div style="position: relative; border-radius: 8px; overflow: hidden;">
                  <img src="${userCard.cards.image_url}" alt="Card" style="width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px;" />
                  <button
                    onclick="document.dispatchEvent(new CustomEvent('deleteCard', { detail: { userId: '${userId}', cardId: '${userCard.cards.id}' } }))"
                    style="position: absolute; top: 8px; right: 8px; background: #d33; color: white; padding: 6px 10px; border-radius: 4px; border: none; cursor: pointer; font-size: 12px;"
                  >
                    ลบ
                  </button>
                </div>
              `;
        }).join('')}
          </div>
        `;
        Swal.fire({
          title: `การ์ดของ User ID: ${userId}`,
          html: `<div style="max-height: 80vh; overflow-y: auto;">${cardsHTML}</div>`,
          width: '90%',
          confirmButtonText: 'Close'
        });

        // จัดการ event ลบ
        document.addEventListener('deleteCard', (event) => {
          const { userId, cardId } = event.detail;
          handleDeleteUserCard(userId, cardId);
        }, { once: true });
      } else {
        Swal.fire({
          title: 'No Cards',
          text: `ไม่พบการ์ดสำหรับ User ID: ${userId}`,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
      Swal.fire({
        title: 'Error',
        text: 'ไม่สามารถโหลดข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'Retry'
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ปุ่มเมนูสำหรับมือถือ */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 text-gray-500 bg-white rounded-lg md:hidden"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-gray-50 dark:bg-gray-800 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 mb-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <ul className="space-y-2 font-medium">
            <li>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsSidebarOpen(false);
                }}
                className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              >
                <span className="ml-3">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('cards');
                  setIsSidebarOpen(false);
                }}
                className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              >
                <span className="ml-3">Card</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('users');
                  setIsSidebarOpen(false);
                }}
                className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              >
                <span className="ml-3">Users</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* เนื้อหาหลัก */}
      <div className="p-3 md:ml-64 min-h-screen">
        <div className="p-3 border-2 border-dashed rounded-lg dark:border-gray-700">
          {loading && <p className="text-center text-gray-600">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="p-3 bg-white rounded-lg shadow text-center">
                    <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                    <p className="text-xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow text-center">
                    <h3 className="text-sm font-medium text-gray-600">Total Cards</h3>
                    <p className="text-xl font-bold">{stats.totalCards}</p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-3 text-gray-800">User Profiles</h2>
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="ค้นหาผู้ใช้ตามชื่อ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg shadow flex flex-col items-center text-center min-w-[100px] max-w-[150px]"
                        >
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">{user.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">
                            รหัสผ่าน: {user.phone_number || 'ไม่มีรหัสผ่าน'}
                          </p>
                          <button
                            onClick={() => handleViewUserCards(user.user_id)}
                            className="w-full px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition"
                          >
                            View UserCard
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center col-span-3">ไม่พบผู้ใช้ที่ตรงกับคำค้นหา</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'cards' && (
                <div>
                  <h2 className="text-lg font-bold mb-3 text-gray-800">Cards</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {cards.length > 0 ? (
                      cards.map((card, index) => (
                        <div
                          key={index}
                          className="p-2 bg-white rounded-lg shadow transition transform hover:-translate-y-1"
                        >
                          <img
                            src={card.image_url}
                            alt={card.title}
                            className="w-full h-36 object-cover rounded mb-2"
                          />
                          <h3 className="font-semibold text-sm text-gray-900 mb-1">{card.title}</h3>
                          <p className="text-xs text-gray-600">{card.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center">No cards found.</p>
                    )}
                  </div>
                  <button
                    onClick={handleCardSubmit}
                    className="w-full mt-4 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-600 transition"
                  >
                    ADD CARD
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