import React, { useEffect } from 'react';
import { UsersDebateRoom } from '../components/debate/UsersDebateRoom';

const UsersDebatePage: React.FC = () => {
  useEffect(() => {
    console.log('[DEBUG] UsersDebatePage: Component mounted');
  }, []);

  console.log('[DEBUG] UsersDebatePage: Rendering');
  
  return (
    <div>
      <div style={{ display: 'none' }}>UsersDebatePage is loading...</div>
      <UsersDebateRoom />
    </div>
  );
};

export default UsersDebatePage;
