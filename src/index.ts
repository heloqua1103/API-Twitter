const name: string = 'Dư Thanh Được'
type Handle = () => Promise<string>

const handle: Handle = async () => Promise.resolve(name)
handle().then(console.log)