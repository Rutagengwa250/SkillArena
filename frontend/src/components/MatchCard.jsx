import React from "react";
const MatchCard = ({ match, onJoin }) => {
  return (
    <div className="border p-4 rounded shadow">
      <p>Match Code: {match.matchCode}</p>
      <p>Stake: {match.stake}</p>
      <p>Status: {match.status}</p>
      <p>Players: {match.participants.length}/2</p>
      {match.status === "waiting" && (
        <button onClick={onJoin} className="bg-green-500 text-white px-2 py-1 mt-2 rounded">
          Join
        </button>
      )}
    </div>
  );
};

export default MatchCard;
