import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

//create useAppwrite hook, pass in function
const useAppwrite = (fn) => {
  const [data, setData] = useState([]);
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    // fetch videos
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const response = await fn();
        setData(response);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  //refetch function
  const refetch = () => fetchData();

  //return data and refetch function
  return { data, isloading, refetch }
}

export default useAppwrite;