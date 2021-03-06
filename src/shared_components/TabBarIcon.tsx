import React from 'react'
import { Ionicons } from '@expo/vector-icons'

import Colors from '../constants/Colors'

interface Props {
  focused: Boolean,
  name: String,
}
export default function TabBarIcon(props: Props) {
  return (
    <Ionicons
      name={props.name}
      size={26}
      style={{ marginBottom: -3 }}
      color={props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
    />
  )
}
