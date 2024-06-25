## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

```
overview of the firebase schema

├── users
│   ├── {userId}
│   │   ├── email: string
│   │   ├── FirstName: string
│   │   ├── LastName: string
│   │   ├
│   │   ├── files
│   │   │   ├── {fileId}
│   │   │       ├── name: string
│   │   │       ├── url: string
│   │   │       ├── createdAt: timestamp
│   │   ├── events
│   │   │   ├── {eventId}
│   │   │       ├── title: string
│   │   │       ├── email: string
│   │   │       ├── start: string
│   │   │       ├── end: string
│   │   │       ├── AllDay: bool
│   │   │       ├── event: event | meeting
│   │   ├── emails
│   │   │   ├── {eventId}
│   │   │       ├── email: string
│   │   │       ├── verified: string
│   |   |── messages
│   |   |   ├── {messageId}
│   |   |       ├── senderId: string
│   |   |       ├── senderEmail: string
│   |   |       ├── receiverId: string
│   |   |       ├── receiverEmail: string
│   |   |       ├── subject: string
│   |   |       ├── message: string
│   |   |       ├── timestamp: timestamp
├── reports
│   ├── {reportId}
│   │   ├── title: string
│   │   ├── url: string
│   │   ├── createdAt: timestamp
│   │   ├── isPublic: boolean
│   │   ├── ownerId: string
├── notifications
│   ├── {notificationId}
│   │   ├── title: string
│   │   ├── content: string
│   │   ├── createdAt: timestamp
│   │   ├── read: boolean

```