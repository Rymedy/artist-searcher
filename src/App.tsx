import {useEffect, useState} from "react";
import './App.css'
import axios from "axios";
import { Artist } from './Artist';

function App() {
  const CLIENT_ID = "763a723264494e2d841c0c944eb7d9e9"
  const REDIRECT_URI = "https://artist-searcher.netlify.app"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState<string>("");
  const [searchKey, setSearchKey] = useState<string>("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [userID, setUserID] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [userImage, setUserImage] = useState<string>("");
  const [userFollowers, setFollowers] = useState<number>(0);
  
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"))?.split("=")[1] || "";
      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    setToken(token || "")

  }, [])

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  const searchArtists = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "artist",
        limit: 50
      }
    });
    setArtists(data.artists.items);
  }

  useEffect(() => {
    const getUserProfile = async () => {
      const {data} = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserID(data.id);
      setDisplayName(data.display_name);
      setUserImage(data.images[1].url);
      setFollowers(data.followers.total);
    };
  
    if (token) {
      getUserProfile();
    }
  }, [token]);

  
  const renderArtists = () => {
    return artists.map((artist: Artist) => (
      <div className="artist-profile" key={artist.id}>
        {artist.images.length ? <img className="artist-img" style={{ backgroundImage: `url(${artist.images[0].url})` }} alt=""/> : <img className="no-artist-img" alt=""/>}
        <h1>{artist.name}</h1>
        {artist.genres.length ? <h2>Genre: <span style={{ color: 'rgb(0, 255, 89)' }}>{artist.genres[0]}</span></h2> : <h2>Genre: <span style={{ color: 'rgb(0, 255, 89)' }}>No Genre</span></h2>}
        <h3>Popularity: <span style={{ color: 'rgb(0, 255, 89)' }}>{artist.popularity}/100</span></h3>
        <h3>Followers: <span style={{ color: 'rgb(0, 255, 89)' }}>{artist.followers.total}</span></h3>
      </div>
    ))
  }

  const renderUser = () => {
    return (
      <div className="profile-info" key={userID}>
        <img className="profile-img" style={{ backgroundImage: `url(${userImage})` }} alt=""/>
        <div className="profile-stats">
        <h1>{displayName}</h1>
        <h3>{userID}</h3>
        <h2>Followers: <span style={{ color: 'white' }}>{userFollowers}</span></h2>
        <button className="loginout-btn" onClick={logout}>Logout</button>
        </div>
      </div>
    )
  }

  const loginElement = () => {
    return (
      <div>
                {token ?
          <form className="search-form" onSubmit={searchArtists}>
            <input className="search-input" type="text" spellCheck="false" placeholder="Enter an artist name..." onChange={e => setSearchKey(e.target.value)}/>
            <button className="loginout-btn" type={"submit"}>Search</button>
          </form>

          : <div className="login-page">
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}><button className="loginout-btn">Login</button></a>
            <br/>
            <h1>Please login to Spotify to continue...</h1>
          </div>
        }
      </div>
    )
  }

  return (
  <div className='App'>
    <header className='App-header'>
      <div className="app-container">
        {renderUser()}
        {loginElement()}
      </div>
        <div className="artists-container">
          {renderArtists()}
        </div>
      </header>
  </div>
  )
}

export default App
