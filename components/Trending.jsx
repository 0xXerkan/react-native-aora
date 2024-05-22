import { View, Text, FlatList, TouchableOpacity, ImageBackground, Image } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { useState } from 'react'
import { Video, ResizeMode } from 'expo-av';

import { icons } from '../constants'

const zoomIn = {
  0: {
    scale: 0.9
  },
  1: {
    scale: 1
  }
};

const zoomOut = {
  0: {
    scale: 1
  },
  1: {
    scale: 0.9
  }
};

const TrendingItem = ({ activeItem, item }) => {
  const [play, setPlay] = useState(false);

  // console.log(activeItem.$id, item.$id);
  //setActiveItem from viewableItemsChanged() sets the activeItem to the key of the viewable item
  //which is the $id of the item in the posts array

  return (
    <Animatable.View 
      className='mr-5'
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      { play ? (
        // <Text className='text-white'>Playing</Text>
        <Video
          source={{ uri: item.video }}
          className='w-52 h-72 rounded-[35px] mt-3 bg-white/10'
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if(status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity 
          className='relative justify-center items-center'
          activeOpacity={0.7}
          onPress={() => setPlay(true)}        
        >
          <ImageBackground 
            source={{ uri: item.thumbnail }}
            className='w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40'
            resizeMode='cover'
          />

          <Image 
            source={icons.play}
            className='w-12 h-12 absolute'
            resizeMode='contain'
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  )
}

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[1]);

  const viewableItemsChanged = ({ viewableItems }) => {
    if(viewableItems.length > 0) {
      //viewableItems.key property comes from the keyExtractor of the FlatList
      // Each item in the viewableItems array is an object that represents a row in the FlatList.
      //The key property of each item is determined by the keyExtractor prop of the FlatList
      setActiveItem(viewableItems[0].key);
    }

  }

  return (
    <FlatList 
      data={posts}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70
      }}
      contentOffset={{ x:170 }}
      horizontal
    />
  )
}

export default Trending