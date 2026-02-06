import { RideInterface } from '@/interfaces/IRide'

export type Section = {
  title: string
  data: RideInterface[]
}

// 🔹 Agrupar corridas por período
export const groupRidesByPeriod = (rides: RideInterface[]): Section[] => {
  const today = new Date()
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const todayRides: RideInterface[] = []
  const thisWeekRides: RideInterface[] = []
  const earlierRides: RideInterface[] = []

  rides.forEach(ride => {
    if (!ride.created_at) return

    const rideDate = new Date(ride.created_at)

    if (rideDate.toDateString() === today.toDateString()) {
      todayRides.push(ride)
    } else if (rideDate >= oneWeekAgo) {
      thisWeekRides.push(ride)
    } else if (rideDate >= oneMonthAgo) {
      earlierRides.push(ride)
    } else {
      earlierRides.push(ride)
    }
  })

  const sections: Section[] = []

  if (todayRides.length > 0) {
    sections.push({ title: 'Hoje', data: todayRides })
  }

  if (thisWeekRides.length > 0) {
    sections.push({ title: 'Esta Semana', data: thisWeekRides })
  }

  if (earlierRides.length > 0) {
    sections.push({ title: 'Anteriormente', data: earlierRides })
  }

  return sections
}

// 🔹 Calcular totais
export const calculateTotals = (rides: RideInterface[]) => {
  const totalEarnings = rides
    .filter(ride => ride.status === 'completed')
    .reduce((sum, ride) => sum + (ride.fare?.payouts?.driver_earnings || 0), 0)

  const totalRides = rides.length

  return { totalEarnings, totalRides }
}
