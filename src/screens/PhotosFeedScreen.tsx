import {
  ActivityIndicator,
  Button,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useInfiniteQuery} from '../api/useInfiniteQuery';
import {getCuratedPhotos} from '../api/makeRequest';
import {PhotoType} from '../api/responseTypes';
import React from 'react';

const screenHorizontalMargin = 12;
const gapBetweenPhotoSnippets = 12;

const photoSnippetWidth =
  (Dimensions.get('window').width -
    2 * screenHorizontalMargin -
    2 * gapBetweenPhotoSnippets) /
  3;

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: 'white',
    flex: 1,
    marginTop: 24,
  },
  photosList: {
    flex: 1,
    paddingHorizontal: screenHorizontalMargin,
  },
  gapStyle: {
    gap: gapBetweenPhotoSnippets,
  },
  photoByText: {
    marginTop: 4,
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  wrapper: {
    flexShrink: 1,
    width: photoSnippetWidth,
  },
  photoSnippetWrapper: {
    borderRadius: 24,
    shadowColor: 'grey',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  photoSnippet: {
    width: photoSnippetWidth,
    borderRadius: 24,
    aspectRatio: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type PhotosFeedScreenProps = {
  navigateToPhotoScreen: (id: number) => void;
};

export function PhotosFeedScreen(props: PhotosFeedScreenProps) {
  const {navigateToPhotoScreen} = props;
  const {
    status,
    isFetchingNextPage,
    isRefetching,
    data,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryFn: (arg?: number) => getCuratedPhotos({page: arg}),
    getNextPageParam: fetchResult => {
      if (fetchResult.next_page) {
        return fetchResult.page + 1;
      }
    },
  });

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text>Error occurred when loading photos</Text>
        <Button onPress={refetch} title={'refetch data'} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <FlatList
        style={styles.photosList}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        contentContainerStyle={styles.gapStyle}
        columnWrapperStyle={styles.gapStyle}
        keyExtractor={item => String(item.id)}
        getItemLayout={(_, index) => ({
          length: photoSnippetWidth,
          offset: photoSnippetWidth * index,
          index,
        })}
        data={data.flatMap(page => page.photos)}
        numColumns={3}
        onEndReached={fetchNextPage}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator size={'large'} /> : null
        }
        renderItem={({item}) => (
          <PhotoSnippet onPress={navigateToPhotoScreen} item={item} />
        )}
      />
    </SafeAreaView>
  );
}

type PhotoSnippetProps = {
  item: PhotoType;
  onPress: (id: number) => void;
};

const PhotoSnippet = React.memo<PhotoSnippetProps>(function PhotoSnippet(
  props,
) {
  const {item, onPress} = props;

  return (
    <Pressable style={styles.wrapper} onPress={() => onPress(item.id)}>
      <View style={styles.photoSnippetWrapper}>
        <Image style={styles.photoSnippet} source={{uri: item.src.medium}} />
      </View>
      <Text style={styles.photoByText}>
        photo by <Text style={styles.textBold}>{item.photographer}</Text>
      </Text>
    </Pressable>
  );
});
