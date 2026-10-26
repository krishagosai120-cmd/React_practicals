import { useState } from 'react';
import './App.css';

function WorkshopCard({ workshop, onRegister }) {
  return (
    <div className="workshop-card">
      <h2>{workshop.title}</h2>
      <p><strong>Date:</strong> {workshop.date}</p>
      <p><strong>Venue:</strong> {workshop.venue}</p>
      <p><strong>Registered:</strong> {workshop.registered}</p>
      <p><strong>Available Seats:</strong> {workshop.capacity - workshop.registered}</p>

      <button
        onClick={() => onRegister(workshop.id)}
        disabled={workshop.registered >= workshop.capacity}
      >
        {workshop.registered >= workshop.capacity ? 'Full' : 'Register Participant'}
      </button>
    </div>
  );
}

function App() {
  const [workshops, setWorkshops] = useState([
    {
      id: 1,
      title: 'Web Development Workshop',
      date: '15 November 2026',
      venue: 'Conference Hall A',
      registered: 25,
      capacity: 40
    },
    {
      id: 2,
      title: 'Artificial Intelligence Summit',
      date: '20 November 2026',
      venue: 'Auditorium',
      registered: 50,
      capacity: 50
    },
    {
      id: 3,
      title: 'UI/UX Design Workshop',
      date: '25 November 2026',
      venue: 'Design Lab',
      registered: 18,
      capacity: 30
    }
  ]);

  function registerParticipant(id) {
    setWorkshops(previous =>
      previous.map(workshop =>
        workshop.id === id &&
        workshop.registered < workshop.capacity
          ? { ...workshop, registered: workshop.registered + 1 }
          : workshop
      )
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Workshop Event Planner</h1>
        <p>Discover workshops and manage event registrations</p>
      </header>

      <div className="workshop-list">
        {workshops.map(workshop => (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
            onRegister={registerParticipant}
          />
        ))}
      </div>
    </div>
  );
}

export default App;