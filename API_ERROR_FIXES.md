# การแก้ไขปัญหา API Error 400 Bad Request

## ปัญหาที่พบ
- POST request ไปยัง `add-usercard` endpoint ได้รับ 400 Bad Request error
- ปัญหาเกิดขึ้นในหน้า `home.jsx` บรรทัด 347
- Error เกิดขึ้นเมื่อผู้ใช้สุ่มไพ่และระบบพยายามบันทึกการ์ดให้ผู้ใช้

## สาเหตุของปัญหา
1. **Authorization Header ไม่ถูกต้อง**: ใช้ `Bearer ${userData.token}` แต่ token อาจจะไม่ถูกต้องหรือไม่มี
2. **Request Body Format**: API อาจต้องการข้อมูลในรูปแบบอื่น
3. **User Data Loading**: การโหลดข้อมูลผู้ใช้ไม่ถูกต้อง ทำให้ `userData.userId` เป็น null หรือ undefined
4. **Token Management**: การจัดการ token ไม่ถูกต้อง

## การแก้ไขที่ทำ

### 1. แก้ไขฟังก์ชัน `updateUserCards` (`src/User/home.jsx`)
- ลบ Authorization header ออก
- เพิ่ม Content-Type header
- เพิ่ม debug logging เพื่อติดตามปัญหา
- ปรับปรุงการจัดการ error

```javascript
const updateUserCards = useCallback(async (cardId) => {
    try {
        console.log('Adding user card:', { user_id: userData.userId, card_id: cardId });
        const response = await axios.post(
            `${API_BASE_URL}add-usercard`,
            { user_id: userData.userId, card_id: cardId },
            {
                timeout: API_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        console.log('User card added successfully:', response.data);
    } catch (error) {
        console.error('Error adding user card:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
    }
}, [userData.userId]);
```

### 2. แก้ไขฟังก์ชัน `updateUserPoint` (`src/User/home.jsx`)
- ลบ Authorization header ออก
- เพิ่ม Content-Type header
- เพิ่ม debug logging
- ปรับปรุงการจัดการ error

### 3. แก้ไขฟังก์ชัน `loadUserData` (`src/User/home.jsx`)
- เพิ่มการตรวจสอบข้อมูลที่จำเป็น
- เพิ่ม debug logging
- ปรับปรุงการจัดการ fallback values
- ตรวจสอบโครงสร้างข้อมูล user

```javascript
const loadUserData = useCallback(() => {
    try {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            console.log('Raw user data from localStorage:', userData);
            
            const userInfo = userData.user;
            console.log('User info:', userInfo);
            
            // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
            if (!userInfo || !userInfo.user_id) {
                console.error('Invalid user data structure:', userInfo);
                return false;
            }
            
            const userDataState = {
                userId: userInfo.user_id,
                token: userInfo.token || null,
                point: userInfo.point || userInfo.token || 0
            };
            
            console.log('Setting user data state:', userDataState);
            setUserData(userDataState);
            return true;
        }
        console.log('No user data found in localStorage');
        return false;
    } catch (error) {
        console.error('Error loading user data:', error);
        return false;
    }
}, []);
```

## ผลลัพธ์ที่คาดหวัง
- ลดการเกิด 400 Bad Request error
- การบันทึกการ์ดให้ผู้ใช้ทำงานได้ปกติ
- การอัปเดตคะแนนผู้ใช้ทำงานได้ปกติ
- Debug logging ช่วยในการติดตามปัญหา

## การทดสอบ
1. เข้าสู่ระบบและไปที่หน้า Home
2. ใช้โค้ดลับเพื่อเพิ่มพลัง
3. สุ่มไพ่และตรวจสอบว่าไม่เกิด error
4. ตรวจสอบ console log เพื่อดู debug information
5. ตรวจสอบว่าการ์ดถูกบันทึกในคอลเลกชัน

## หมายเหตุ
- หากยังเกิด error ให้ตรวจสอบ console log เพื่อดูรายละเอียด
- อาจต้องตรวจสอบ API endpoint ที่ backend ว่าต้องการข้อมูลในรูปแบบใด
- หากต้องการ Authorization header อาจต้องปรับปรุงการจัดการ token 