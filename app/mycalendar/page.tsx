'use client'
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { firestore } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveAs } from 'file-saver';

interface CustomEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  type: 'event' | 'meeting';
  email: string; // to store the associated email
}

interface UserEmail {
  id: string;
  email: string;
}

const FullCalendarScheduler = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'event' | 'meeting'>('all');
  const [selectInfo, setSelectInfo] = useState<DateSelectArg | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'event' | 'meeting'>('event');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventClickArg | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | 'All'>('All');
  const [userEmails, setUserEmails] = useState<UserEmail[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchUserEmails();
    }
  }, [currentUser]);

  useEffect(() => {
    fetchEvents();
  }, [currentEmail]);

  const fetchUserEmails = async () => {
    try {
      if (!currentUser) return;
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        throw new Error('User not found');
      }

      const userData = userDocSnapshot.data();
      const emails = userData?.emails || [];

      if (!emails.includes(currentUser.email)) {
        emails.unshift(currentUser.email); // Add the primary email to the start of the list
      }

      const emailsCollectionRef = collection(firestore, 'users', currentUser.uid, 'emails');
      const emailSnapshot = await getDocs(emailsCollectionRef);
      const fetchedEmails = emailSnapshot.docs.map(doc => {
        const data = doc.data();
        return data.email;
      });

      const combinedEmails = Array.from(new Set([...emails, ...fetchedEmails]));
      const emailObjects = combinedEmails.map((email: string) => ({ id: email, email }));

      setUserEmails([{ id: 'All', email: 'All' }, ...emailObjects]); 
    } catch (err) {
      console.error('Error fetching user emails:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      if (!currentUser) return;

      let eventsData: CustomEvent[] = [];
      if (currentEmail === 'All') {
        const eventsCollection = collection(firestore, 'users', currentUser.uid, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CustomEvent[];
      } else {
        const eventsCollection = collection(firestore, 'users', currentUser.uid, 'events');
        const eventsQuery = query(eventsCollection, where('email', '==', currentEmail));
        const eventsSnapshot = await getDocs(eventsQuery);
        eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CustomEvent[];
      }

      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectInfo(selectInfo);
    setShowModal(true);
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    setEventToDelete(clickInfo);
    setShowDeleteEventModal(true);
  };

  const handleEventDrop = async (changeInfo: EventDropArg) => {
    if (!currentUser) return;
    try {
      const eventDoc = doc(firestore, 'users', currentUser.uid, 'events', changeInfo.event.id);
      await updateDoc(eventDoc, {
        start: changeInfo.event.start,
        end: changeInfo.event.end,
        allDay: changeInfo.event.allDay,
      });
      setEvents(prevEvents => prevEvents.map(event =>
        event.id === changeInfo.event.id ? { ...event, start: changeInfo.event.startStr, end: changeInfo.event.endStr, allDay: changeInfo.event.allDay } : event
      ));
    } catch (err) {
      console.error('Error updating event:', err);
    }
  };

  const handleAddEvent = async () => {
    if (!selectInfo || !currentUser || !newEventTitle.trim() || !currentEmail) return;

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    const newEvent: Omit<CustomEvent, 'id'> = {
      title: newEventTitle,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      type: newEventType,
      email: currentEmail,
    };

    try {
      const eventDoc = await addDoc(collection(firestore, 'users', currentUser.uid, 'events'), newEvent);
      const eventWithId = { id: eventDoc.id, ...newEvent };
      setEvents(prevEvents => [...prevEvents, eventWithId]);
      calendarApi.addEvent({
        id: eventDoc.id,
        ...newEvent,
        backgroundColor: newEventType === 'event' ? 'blue' : 'green',
        borderColor: newEventType === 'event' ? 'blue' : 'green',
      });
    } catch (err) {
      console.error('Error adding event:', err);
    }

    setNewEventTitle('');
    setShowModal(false);
  };

  const handleDeleteEvent = async () => {
    if (!currentUser || !eventToDelete) return;
    try {
      await deleteDoc(doc(firestore, 'users', currentUser.uid, 'events', eventToDelete.event.id));
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete.event.id));
      eventToDelete.event.remove();
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setShowDeleteEventModal(false);
    }
  };

  const handleEmailChange = (email: string) => {
    setCurrentEmail(email);
  };

  const filteredEvents = filter === 'all' ? events : events.filter(event => event.type === filter);


  const downloadICSFile = () => {
    const icsContent = convertToICS(filteredEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, 'calendar.ics');
  };

  const convertToICS = (events: CustomEvent[]) => {
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
    events.forEach(event => {
      const endDate = event.end ? formatDateToICS(event.end) : '';
      icsContent += `BEGIN:VEVENT\nSUMMARY:${event.title}\nDTSTART:${formatDateToICS(event.start)}\n${endDate ? `DTEND:${endDate}\n` : ''}END:VEVENT\n`;
    });
    icsContent += 'END:VCALENDAR';
    return icsContent;
  };

  const formatDateToICS = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };


  return (
    <div className='p-4'>
      <div className="mb-4 text-right">
        <label htmlFor="emailSelect" className="mr-2">Select Email:</label>
        <select
          id="emailSelect"
          value={currentEmail || ''}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          {userEmails.map((email) => (
            <option key={email.id} value={email.email}>{email.email}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="filter" className="mr-2">Filter:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'event' | 'meeting')}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">All</option>
          <option value="event">Events</option>
          <option value="meeting">Meetings</option>
        </select>
      </div>

      <div className="mb-4 text-right">
        <Button variant='blue'
          onClick={downloadICSFile}>
          Download Calendar
        </Button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={filteredEvents.map(event => ({
          ...event,
          backgroundColor: event.type === 'event' ? 'blue' : 'green',
          borderColor: event.type === 'event' ? 'blue' : 'green',
        }))}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
      />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <RadioGroup value={newEventType} onValueChange={(value) => setNewEventType(value as 'event' | 'meeting')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event" id="event" />
                <label htmlFor="event">Event</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="meeting" id="meeting" />
                <label htmlFor="meeting">Meeting</label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="blue" onClick={handleAddEvent}>Add Event</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteEventModal} onOpenChange={setShowDeleteEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this event/Meeting?</p>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteEvent}>Delete</Button>
            <Button variant="outline" onClick={() => setShowDeleteEventModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FullCalendarScheduler;
