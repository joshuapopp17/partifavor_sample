import { StatusBar , StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackHeader from '../../../components/headers/BackHeader'
import SectionHeader from '../../../components/headers/SectionHeader'
import Button from '../../../components/buttons/Button'
import { useNavigation } from '@react-navigation/native'
import useEvent from '../../../hooks/useEvent'
import supabase from '../../../lib/Supabase'
import useFriends from '../../../hooks/useFriends'
import { useEffect } from 'react'
import LoadingPlaceHolder from '../../../components/loading/LoadingPlace';
import FriendList from '../../../components/lists/FriendList'
import useAuth from '../../../hooks/useAuth'

const CreateScreenFriends = () => {
  const navigation = useNavigation()
  const {event, setEvent, friendInvites, setFriendInvites, list, setList, getAttendingEvents, getHostedEvents} = useEvent()
  const {friends, getFriends, loading} = useFriends()
  const {user} = useAuth()

  const createInvite = async (id) => {
    let invites = await friendInvites.map((friend, index) => {
      return {event_id: id, recipient_id: friend}
    })
    return invites
  }

  const createPartifavors = async (id) => {
    let partifavors
    if (list.length == 0) {
       partifavors = []
    } else {
        partifavors = await list.map((item, index) => {
        console.log(item)
        return {name: item, event_id: id}
      })
    }
    return partifavors
  }

  const createNotifications = async (notifIds) => {
    let notificationData = await notifIds.map((notification, index) => {
      return {type: "ei", eInvite_id: notification.id, recipient_id: notification.recipient_id, seen: false}
    })
    return notificationData
  }

  const setPartifavors = async (partifavors) => {
    if (partifavors.length == 0) {
      return true
    } else {
      const { data, error } = await supabase.from('partifavors').insert(partifavors)
      if (error) {
        console.log(error.message)
      } else {
        console.log("DONE")
        return data
      }
    }
  }

  const sendNotifications = async (notifIds) => {
    console.log("sending notifications")
    let notificationData = await createNotifications(notifIds)
    const { data, error } = await supabase.from('notifications').insert(notificationData)
    if (error) {
      console.log(error.message)
    } else {
    }
    }

  const sendInvites = async (invites) => {
    console.log("sending notifications")
    const { data, error } = await supabase.from('event_invites').insert(invites)
    if (error) {
      console.log(error.message)
    } else {
      return data
    }
    }

    const updateEventInvite = async (obj) => {
      const { data, error } = await supabase.from('attending_events')
        .insert([{user_id: user.id, event_id: obj[0].id}])
        if (error) {
          console.log(error.message)
        }
    }

    

  const saveEvent = async () => {
    const obj = {...event}
    const { data, error } = await supabase
      .from('events')
      .insert(obj)
      if (error) {
        console.log(error)
      } else {
        setEvent(obj)
        setFriendInvites([])
        await updateEventInvite(data)
        navigation.navigate("CreateScreenAd")
      }
      let invites = await createInvite(data[0].id)
      let partifavors = await createPartifavors(data[0].id)
      let notifIds = await sendInvites(invites)
      await sendNotifications(notifIds)
      await setPartifavors(partifavors)
      setList([])
      getHostedEvents(user.id)
      getAttendingEvents(user.id)
      
  }

  useEffect(() => {
    getFriends()
  }, [])

  useEffect(() => {
  }, [friends])

  return (
    <SafeAreaView style={styles.screenView}> 
      <StatusBar backgroundColor={"#fff"} barStyle={'dark-content'}></StatusBar>
      <BackHeader onPress={() => navigation.navigate("CreateScreen")}/>
      <View style={styles.container}>
        <View style={{marginBottom: 20}}>
          <SectionHeader title={"Invite your friends!"}/>
        </View>
        {loading ? <LoadingPlaceHolder /> : friends ? <FriendList friends={friends} add={true}/> : <Text style={{fontSize: 20, marginLeft: 20}}>No partys</Text>}
        <View style={{marginBottom: 30}}>
          <Button backgroundColor={"#FF8F1C"} color={"#fff"} fontSize={20} title={"Complete"} action={() => saveEvent()}/>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default CreateScreenFriends

const styles = StyleSheet.create({
    screenView: {
        height: '100%',
        width: '100%',
        backgroundColor: '#fff',
      },
      container: {
        width: '100%',
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 25
      }
})
