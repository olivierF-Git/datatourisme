import { React } from 'react';
import { useQuery, gql } from '@apollo/client';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';


  const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`;

  function DisplayLocations() {
    const { loading, error, data } = useQuery(GET_LOCATIONS);
  
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
  
    return data.locations.map(({ id, name, description, photo }) => (
      <div key={id}>
        <h3>{name}</h3>
        <img width="400" height="250" alt="location-reference" src={`${photo}`} />
        <br />
        <b>About this location:</b>
        <p>{description}</p>
        <br />
      </div>
    ));
  }

export default function App() {
  return (
    <div>

      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{height:600}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
      <form>
        Rechercher par ville <input type="text" />
        Rechercher par type <input type="text" />
      </form>
      nbResultats = 
      Une liste des types disponibles 
    </div>
  );
}