import './App.css';

function StudentCard(props) {
  return (
    <div className="student-card">
      <h2>{props.name}</h2>
      <p>Roll Number: {props.rollNo}</p>
      <p>Course: {props.course}</p>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <h1>Student Information System</h1>

      <StudentCard
        name="Krisha Gosai"
        rollNo="101"
        course="M.Sc. CA & IT"
      />

      <StudentCard
        name="Rajveer gosai"
        rollNo="102"
        course="M.Sc. CA & IT"
      />

      <StudentCard
        name="yuvraj Gosai"
        rollNo="103"
        course="M.Sc. CA & IT"
      />
    </div>
  );
}

export default App;