// import  { useState, useEffect } from "react";
// import { FaLocationDot } from "react-icons/fa6"; // Import the location icon


// const Location = () => {
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Fetch the user's location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           // Call reverse geocoding API
//           fetchCityAndZipcode(latitude, longitude);
//         },
//         (error) => {
//           setError("Unable to retrieve your location.");
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by your browser.");
//     }
//   }, []);

//   const fetchCityAndZipcode = async (latitude, longitude) => {
//     const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.address) {
//         const { city, town, village, postcode } = data.address;
//         // Use city, town, or village depending on what's available
//         const locationName = city || town || village;
//         if (locationName) setCity(locationName);
//         if (postcode) setZipcode(postcode);
//       } else {
//         setError("Unable to fetch location details.");
//       }
//     } catch (error) {
//       setError("Error fetching location details.");
//     }
//   };

//   return (
//     <div>
//       {error ? (
//         <p>Error: {error}</p>
//       ) : (
//         <p>
//            <FaLocationDot />{city} {zipcode}
//         </p>
//       )}
//     </div>
//   );
// };

// export default Location;








import { useState, useEffect } from "react";
import { FaLocationDot } from "react-icons/fa6";

const Location = () => {
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // SIMPLER NAMES - you choose these!
  const LOCATION_CACHE_KEY = "my_city_zipcode";
  const LOCATION_TIME_KEY = "my_location_time";
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  useEffect(() => {
    const getLocation = async () => {
      setIsLoading(true);
      
      // Check if we have cached location
      const cachedLocation = getCachedLocation();
      if (cachedLocation) {
        setCity(cachedLocation.city);
        setZipcode(cachedLocation.zipcode);
        setIsLoading(false);
        return;
      }

      // If no cache, ask for location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchCityAndZipcode(latitude, longitude);
            setIsLoading(false);
          },
          (error) => {
            setError("Location access denied or unavailable.");
            setIsLoading(false);
          }
        );
      } else {
        setError("Geolocation not supported.");
        setIsLoading(false);
      }
    };

    getLocation();
  }, []);

  const getCachedLocation = () => {
    try {
      const savedData = localStorage.getItem(LOCATION_CACHE_KEY);
      const savedTime = localStorage.getItem(LOCATION_TIME_KEY);
      
      if (!savedData || !savedTime) return null;

      const now = Date.now();
      const savedTimeNumber = parseInt(savedTime, 10);
      
      // Check if cache is still fresh (less than 24 hours old)
      if (now - savedTimeNumber < CACHE_DURATION) {
        return JSON.parse(savedData);
      }
      
      // Clear old cache
      localStorage.removeItem(LOCATION_CACHE_KEY);
      localStorage.removeItem(LOCATION_TIME_KEY);
      return null;
    } catch (error) {
      return null;
    }
  };

  const saveLocationToCache = (city, zipcode) => {
    try {
      const locationInfo = { city, zipcode };
      const currentTime = Date.now().toString();
      
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationInfo));
      localStorage.setItem(LOCATION_TIME_KEY, currentTime);
    } catch (error) {
      console.log("Could not save location to cache");
    }
  };

  const fetchCityAndZipcode = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.address) {
        const { city, town, village, postcode } = data.address;
        const locationName = city || town || village;
        
        if (locationName) setCity(locationName);
        if (postcode) setZipcode(postcode);
        
        // Save to cache for next time
        if (locationName || postcode) {
          saveLocationToCache(locationName || "", postcode || "");
        }
      } else {
        setError("Unable to fetch location details.");
      }
    } catch (error) {
      setError("Error fetching location details.");
    }
  };

  if (isLoading) {
    return <p>Loading location...</p>;
  }

  return (
    <div>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <p>
          <FaLocationDot /> {city} {zipcode}
        </p>
      )}
    </div>
  );
};

export default Location;