function selectDeviceById (id, devices) {
  for (let i = 0; i < devices.length; i++) {
    const device = devices[i]
    if (device.id === id) return device
  }
  return null
}

export default selectDeviceById
