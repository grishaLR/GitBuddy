import React, { Component } from "react";
import Typed from "react-typed";
import { Switch, Route, Router, Link, useLocation } from "react-router-dom";

// import Octocat from '../assets/Octocat.jpg';
// const octocatURL: 'https://github.githubassets.com/images/modules/logos_page/Octocat.png'

function Login(props) {
  const oAuthUrl =
    "https://github.com/login/oauth/authorize?client_id=13e0e054832447d72513&redirect_uri=http://localhost:3000/login";
  return (
    <div className="oauth">
              <Typed      
          className="headerLogin"
          strings={['GitBuddy']}
          typeSpeed={300}
        />
        <br/>
      <a href={`${oAuthUrl}`}>
        <img
          src='/assets/Octocat.png'
          className="octoCat"
          alt="GitHub Octocat"
        ></img>
      </a>{" "}
      <br />
      <Typed
        className="landingClick"
        strings={["click here to login", "click here to see your followers", "click here to see your stargazers"]}
        startDelay={4000}
        typeSpeed={100}
        backSpeed={100}
        loop={true, 30}
      />
      <br />
      {/* <p>click here to login</p> */}
    </div>
  );
}

export default Login;
