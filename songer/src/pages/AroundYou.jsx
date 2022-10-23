import { useState, useEffect } from "react";
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { Error, Loader, SongCard } from "../components";
import { useGetCountriesQuery, useGetSongsByCountryQuery } from "../redux/services/shazamCore";
import { selectCountry } from "../redux/features/playerSlice";

const AroundYou = () => {

    var countryList = []
    const dispatch = useDispatch();
    const [homeCountry, setHomeCountry] = useState('');
    const [loading, setLoading] = useState(true);
    const { activeSong, isPlaying, country} = useSelector((state) => state.player);
    
    useEffect(()=>{
        axios.get(`https://geo.ipify.org/api/v2/country?apiKey=${import.meta.env.VITE_GEO_API_KEY}`)
        .then((res) => setHomeCountry(res?.data?.location?.country))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    },[homeCountry]);

    const {data, isFetching, error} = useGetSongsByCountryQuery(country || homeCountry);
    const {data: countryData, isFetching: isFetchingCountry, error: countryError} = useGetCountriesQuery();

    countryData?.map((country) => {countryList.push({title:country.name, value:country.code})})

    countryList.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))
    const homeCountryTitle = countryList.find(({value}) => value === homeCountry )?.title;
    const countryTitle = countryList.find(({value}) => value === country )?.title;


    if (isFetching && loading) return <Loader title="Loading songs around you" />;

    if ((error || countryError) && homeCountry) return <Error />;
    
    return(
        <div className="flex flex-col">
            <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
                <h2 className="font-bold text-3xl text-white text-left mt-4 mb-10">
                   { (homeCountry === country) ? (
                       <span className="font-black">
                            Around You in {homeCountryTitle}
                        </span>
                      ):(
                            <span className="font-black">
                                Top songs in {countryTitle || homeCountryTitle}
                            </span>
                        )
                   } 
                </h2>
                <select
                 onChange={(e) => dispatch(selectCountry(e.target.value))}
                 value = {country || homeCountry}
                 className="bg-black text-gray-300 p-3 text-sm outline-none sm:mt-0 mt-5 rounded-lg"
                 >
                    {countryList.map((country) => 
                        <option key={country.value} value = {country.value}>
                            {country.title}
                        </option>)
                    }
                </select>
            </div>
            <div className="flex flex-wrap sm:justify-start justify-center gap-8">
                {data?.map((song, i) => (
                    <SongCard
                        key={song.key}
                        song={song}
                        isPlaying={isPlaying}
                        activeSong={activeSong}
                        data={data}
                        i={i}
                    />
                ))}
            </div>
        </div>
    );
};

export default AroundYou;
