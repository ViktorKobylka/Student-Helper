import { useState } from 'react'; 
import logotype from '../styles/images/logotype.jpg'; 
import '../styles/MainPage.css';  

const MainPage = () => {
 
  return (
    <div>
      <header className="main-header">
        <img src={logotype} alt="logotype" />
        <strong>Student Helper</strong>
      </header>
    </div>
     
    );
}

export default MainPage;
