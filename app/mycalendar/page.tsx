// components/FullCalendarScheduler.tsx
'use client'
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { firestore } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';

interface CustomEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
}

const FullCalendarScheduler = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CustomEvent[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      fetchEvents();
    }
  }, [currentUser]);

  const fetchEvents = async () => {
    if (!currentUser) return;
    const eventsCollection = collection(firestore, 'users', currentUser.uid, 'events');
    const eventsSnapshot = await getDocs(eventsCollection);
    const eventsData = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CustomEvent[];
    setEvents(eventsData);
  };

  const handleDateSelect = async (selectInfo: DateSelectArg) => {
    if (!currentUser) return;
    const title = prompt('Enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    //adding filter: events/meetings
    

    if (title) {
      try {
        const newEvent = {
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
        };
        const eventDoc = await addDoc(collection(firestore, 'users', currentUser.uid, 'events'), newEvent);
        calendarApi.addEvent({
          id: eventDoc.id,
          ...newEvent,
        });
      } catch (err) {
        console.error('Error adding event:', err);
      }
    }
  };

  const handleEventClick = async (clickInfo: EventClickArg) => {
    if (!currentUser) return;
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      try {
        await deleteDoc(doc(firestore, 'users', currentUser.uid, 'events', clickInfo.event.id));
        clickInfo.event.remove();
      } catch (err) {
        console.error('Error deleting event:', err);
      }
    }
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
    } catch (err) {
      console.error('Error updating event:', err);
    }
  };

  return (
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
      events={events}
      select={handleDateSelect}
      eventClick={handleEventClick}
      eventDrop={handleEventDrop}
    />
  );
};

export default FullCalendarScheduler;
