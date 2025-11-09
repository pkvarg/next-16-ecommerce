# Authentication Setup - Frontend Connected to Backend

## ✅ What's Been Configured

Your Next.js 16 frontend is now fully connected to your NestJS backend authentication system.

---

## 🔗 Connection Overview

```
Next.js Frontend (localhost:3000)
        ↓
NextAuth Configuration
        ↓
NestJS Backend API (localhost:3016)
        ↓
PostgreSQL Database
```

---

## 📄 Files Modified/Created

### Frontend (Next.js 16)

1. **[app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)** ✅ Updated
   - Credentials provider connects to `/auth/login`
   - Google provider connects to `/auth/signup/google`
   - JWT tokens stored in session
   - User data synced with backend

2. **[app/signup/page.tsx](app/signup/page.tsx)** ✅ Created
   - Email/password signup form
   - Calls NestJS `/auth/signup` endpoint
   - Auto-login after successful signup
   - Google OAuth signup button
   - Matches your login page design

3. **[app/login/page.tsx](app/login/page.tsx)** ✅ Already exists
   - Email/password login form
   - Uses NextAuth credentials provider
   - Google OAuth login button

4. **[.env](.env)** ✅ Configured
   - `NEXT_PUBLIC_API_URL` → Points to NestJS backend
   - `NEXTAUTH_SECRET` → Configured
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` → Configured

---

## 🔐 Authentication Flows

### **Email/Password Signup Flow**

1. User fills signup form at `/signup`
2. Frontend → `POST http://localhost:3016/auth/signup`
   ```json
   {
     "email": "user@example.com",
     "password": "password123",
     "name": "John Doe"
   }
   ```
3. Backend creates user & returns JWT token
4. Frontend auto-logs in using NextAuth credentials provider
5. User redirected to homepage

### **Email/Password Login Flow**

1. User fills login form at `/login`
2. NextAuth credentials provider → `POST http://localhost:3016/auth/login`
3. Backend validates credentials & returns JWT token
4. Token stored in NextAuth session
5. User redirected to homepage

### **Google OAuth Flow**

1. User clicks "Sign in/up with Google"
2. Google OAuth authentication
3. NextAuth callback → `POST http://localhost:3016/auth/signup/google`
   ```json
   {
     "email": "user@gmail.com",
     "googleId": "google-user-id",
     "name": "Jane Smith"
   }
   ```
4. Backend creates/updates user & returns JWT token
5. Token stored in NextAuth session
6. User redirected to homepage

---

## 🧪 Testing the Integration

### Test Email/Password Signup

1. Start both servers:
   ```bash
   # Terminal 1 - NestJS Backend
   cd /Users/pictus/PW-Local-Projects/nest-pic-server
   npm run start:dev

   # Terminal 2 - Next.js Frontend
   cd /Users/pictus/PW-Local-Projects/next16
   npm run dev
   ```

2. Open browser: `http://localhost:3000/signup`
3. Fill the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"
5. Should auto-login and redirect to homepage

### Test Email/Password Login

1. Go to: `http://localhost:3000/login`
2. Enter credentials from signup
3. Click "Sign In"
4. Should redirect to homepage

### Test Google OAuth

1. Go to `/login` or `/signup`
2. Click "Sign in/up with Google"
3. Complete Google authentication
4. User created/updated in NestJS backend
5. Should redirect to homepage

---

## 🔧 Environment Variables

### Next.js Frontend (.env)
```env
NEXT_PUBLIC_API_URL="http://localhost:3016"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### NestJS Backend (.env)
```env
PORT=3016
DATABASE_URL="postgres://..."
JWT_SECRET="your-jwt-secret"
JWT_EXPIRATION="7d"
```

---

## 📊 Database

Users are stored in PostgreSQL `users` table:

```sql
users
├── id (uuid)
├── email (unique)
├── password (nullable - for OAuth users)
├── name
├── googleId (unique, nullable)
├── provider ('local' | 'google')
├── isActive
├── emailVerified
├── createdAt
└── updatedAt
```

---

## 🔒 Accessing User Data

### In Next.js Pages/Components

```typescript
'use client'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { data: session } = useSession()

  if (!session) {
    return <p>Not logged in</p>
  }

  return (
    <div>
      <p>Email: {session.user?.email}</p>
      <p>Name: {session.user?.name}</p>
      <p>User ID: {(session.user as any).id}</p>
      <p>Access Token: {(session as any).accessToken}</p>
    </div>
  )
}
```

### Making Authenticated API Calls

```typescript
const session = await getSession()
const accessToken = (session as any).accessToken

const response = await fetch('http://localhost:3016/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
```

---

## 🛡️ Protecting Backend Routes

To protect any NestJS endpoint, add the JWT guard:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  @Post('image')
  @UseGuards(JwtAuthGuard)  // Protect this route
  async uploadImage(@Request() req, @UploadedFile() file) {
    // req.user contains authenticated user
    console.log('User:', req.user.email)
    // ... your logic
  }
}
```

---

## 🚀 Production Deployment

### Update environment variables:

**Frontend:**
```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.com"
NEXTAUTH_URL="https://your-frontend-domain.com"
```

**Backend:**
- Update CORS origin in `main.ts`
- Set strong `JWT_SECRET`
- Use production database

---

## 📝 Next Steps

1. ✅ Test signup flow
2. ✅ Test login flow
3. ✅ Test Google OAuth
4. Add email verification (optional)
5. Add password reset flow (optional)
6. Protect sensitive routes with JWT guard
7. Add user profile page
8. Deploy to production

---

## 🐛 Troubleshooting

### "Failed to sign up" error
- Check if backend is running on port 3016
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Check browser console for errors

### "Invalid credentials" error
- Verify password meets minimum requirements (6 chars)
- Check if user exists in database
- OAuth users cannot login with password

### Google OAuth not working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check Google Cloud Console callback URL
- Should be: `http://localhost:3000/api/auth/callback/google`

### CORS errors
- Backend CORS is configured for `http://localhost:3000`
- Check if frontend is running on this URL

---

## 🎉 You're All Set!

Your authentication system is fully functional with:
- ✅ Email/password signup & login
- ✅ Google OAuth
- ✅ JWT token management
- ✅ User data in PostgreSQL
- ✅ Protected routes ready
- ✅ Session management

Try it out by visiting:
- **Signup**: http://localhost:3000/signup
- **Login**: http://localhost:3000/login
