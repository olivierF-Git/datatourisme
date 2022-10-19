import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function App() {
  const [GET_LOCATIONS, setGetLocation] = useState(gql`	
                            {
                              poi(
                                size: 1000
                                filters: [{
                                  isLocatedAt: {
                                    schema_address: {
                                      schema_addressLocality: {
                                        _eq: "La Rochelle"
                                      }
                                    }
                                  }
                                }
                                ]) {
                                total results {
                                    rdfs_label{
                                      value 
                                    }
                                    isLocatedAt{
                                    schema_geo{
                                      schema_latitude
                                      schema_longitude
                                    }
                                  }
                                }
                              }
                            }
                            `);

  const [ville, setVille] = useState("")
  const [type, setType] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const { loading, error, data } = useQuery(GET_LOCATIONS);

  const requeteGql = (event) => {
    event.preventDefault();
    if (latitude && longitude) {
      setGetLocation(gql`    
      {
        poi(
          size: 25,
          filters: [{
            isLocatedAt: {
              schema_geo: {
                schema_latitude: {
                  _gte: ${parseFloat(latitude-0.1)}
                  _lte: ${parseFloat(latitude+0.1)}
                }
                schema_longitude: {
                    _gte: ${parseFloat(longitude-0.1)}
                    _lte: ${parseFloat(longitude+0.1)}
                }
              }
            }
          }
          ]) {
            total results {
              rdfs_label{
                value
              }
              isLocatedAt{
              schema_geo{
                schema_latitude
                schema_longitude
              }
            }
          }
        }
      }
    `)
    }
    if (ville && type) {
      setGetLocation(gql`	
     {
      poi(
        size: 1000,
        filters: [{
          rdf_type: {
            _eq: "https://www.datatourisme.fr/ontology/core#${type.charAt(0).toUpperCase() + type.slice(1)}"
          }
        }, {
          isLocatedAt: {
            schema_address: {
              schema_addressLocality: {
                _eq: "${ville.charAt(0).toUpperCase() + ville.slice(1)}"
              }
            }
          }
        }
        ]) {
          total results {
            rdfs_label{
              value 
            }
            isLocatedAt{
            schema_geo{
              schema_latitude
              schema_longitude
            }
          }
        }
      }
    }
  `)
    }
    if (ville && !type) {
      setGetLocation(gql`	
      {
       poi(
        size: 1000,
         filters: [{
           isLocatedAt: {
             schema_address: {
               schema_addressLocality: {
                 _eq: "${ville.charAt(0).toUpperCase() + ville.slice(1)}"
               }
             }
           }
         }
         ]) {
           total results {
             rdfs_label{
               value 
             }
             isLocatedAt{
             schema_geo{
               schema_latitude
               schema_longitude
             }
           }
         }
       }
     }
   `);
    }
    if (!ville && type) {
      setGetLocation(gql`	
      {
       poi(
        size: 1000,
         filters: [{
           rdf_type: {
             _eq: "https://www.datatourisme.fr/ontology/core#${type.charAt(0).toUpperCase() + type.slice(1)}"
           }
         }
         ]) {
           total results {
             rdfs_label{
               value 
             }
             isLocatedAt{
             schema_geo{
               schema_latitude
               schema_longitude
             }
           }
         }
       }
     }
   `)
    }
  }

  function DisplayLocation() {

    if (error) return <p>Error :(</p>;
    if (loading) return <p>Loading...</p>;
    var positionPoi = [46.156227, -1.148393]
    if (data.poi.results[0]) {
      positionPoi = [data.poi.results[0].isLocatedAt[0].schema_geo[0].schema_latitude[0], data.poi.results[0].isLocatedAt[0].schema_geo[0].schema_longitude[0]];
    }
    
    return (
      <MapContainer center={positionPoi ? positionPoi : [46.156227, -1.148393]} zoom={13} scrollWheelZoom={false} style={{ height: 600 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.poi.results.map(({ isLocatedAt, rdfs_label }) => (
          <Marker position={[isLocatedAt[0].schema_geo[0].schema_latitude[0], isLocatedAt[0].schema_geo[0].schema_longitude[0]]}>
            <Popup>
              {rdfs_label[0].value}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    )
  }

  return (
    <div>
      <p>/!\ Disclaimer /!\</p>
      <p>Suivant le lieux, la requête peux être un peu longue car elle récupère au maximum 1000 résultats</p>
      <p>Il semblerais que les lieux soient cantonné au Sud-Ouest voire à la Nouvelle-Aquitaine</p>
      <p>Attention à bien remplir soit la longitude/latitude, soit la ville et/ou type</p>
      <DisplayLocation />
      <form onSubmit={requeteGql}>
        <label>Rechercher par ville
          <input type="text" value={ville} onChange={e => setVille(e.target.value)} />
        </label>
        <br />
        <label>Rechercher par type
          <input type="text" value={type} onChange={e => setType(e.target.value)} />
        </label>
        <br />
        <label>Rechercher par Latitude
          <input type="text" value={latitude} onChange={e => setLatitude(e.target.value)} />
          et Longitude
          <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} />
        </label>
        <br />
        <input type={"submit"} value={"Rechercher"} />
      </form>
      nbResultats = {data && data.poi.results ? data.poi.results.length : 0}
      <br />
      Une liste des types est disponible <a href='https://www.datatourisme.fr/ontology/core'>ici</a>
      <br />
      Par exemple, vous pouvez tester avec Hotel, Restaurant, Tour, ReligiousSite, Beach ou encore CyberCafe
    </div>
  );
}