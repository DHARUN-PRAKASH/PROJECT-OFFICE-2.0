import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Table from './table';
import Form from './form';
import SignIn from './signin';
import ConsolidateAndSummary from './consolidate_summary';
import { Admin } from './admin';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  (sessionStorage.getItem('logged'))
    ? (
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<Table />} />
          <Route exact path='/form' element={<Form/>} />
          <Route exact path='/cs' element={<ConsolidateAndSummary/>} />
          <Route exact path='/admin' element={<Admin/>} /> 
        </Routes>
      </BrowserRouter>
    )
    : (
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<SignIn />} />
        </Routes>
      </BrowserRouter>
    )
);