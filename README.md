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
│   │   ├── folders
│   │   │   ├── {foldername}
│   │   │       ├── files
|   │   │   │       ├── {filename}
|   |   │   │   │       ├── name
|   |   │   │   │       ├── url
|   |   │   │   │       ├── createdAt
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
│   │   ├── notes
│   │   │   ├── {notesId}
│   │   │       ├── userId: string
│   │   │       ├── title: string
│   │   │       ├── content: string
│   │   │       ├── label: string
│   │   ├── tasks
│   │   │   ├── {taskId}
│   │   │       ├── title: string
│   │   │       ├── done: bool
│   │   ├── contacts
│   │   │   ├── {contactId}
│   │   │       ├── email: string
│   │   │       ├── name: string
│   │   │       ├── phone: string
│   │   │       ├── id: string
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
├── resources
│   ├── {resourceId}
│   │   ├── name: string
│   │   ├── id: string
│   │   ├── address: string
│   │   ├── description:string
│   │   ├── image: string
│   │   ├── latitude: number
│   │   ├── longitude: number
│   │   ├── openinghours:string
│   │   ├── rating: string
│   │   ├── type:string



```

![Screenshot (16)](https://github.com/iotSensorZ/sensorsZ/assets/172040357/4e66ef06-4644-45cf-848e-91aa80515586)

