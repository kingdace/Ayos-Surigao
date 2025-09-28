import { Platform } from 'react-native';

// Web-compatible map components
let MapView: any;
let Marker: any;
let Region: any;

if (Platform.OS === 'web') {
  // Web fallback components
  MapView = ({ children, style, ...props }: any) => {
    const { View } = require('react-native');
    return <View style={style} {...props}>{children}</View>;
  };
  Marker = ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  };
  Region = {};
} else {
  // Native maps - only import on native platforms
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
  Region = Maps.Region;
}

export { MapView, Marker, Region };
