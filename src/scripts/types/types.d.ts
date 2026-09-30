type User = {
  id: number
  username: string
  email: string
  initials: string
  accessLevel: number
  type: 'office' | 'shop'
  subtype?: 'sales' | 'frontDesk' | 'dev'
};

type ShippingListSection = {
  name: string | null
  rows: ShippingListRow[]
};

type ShippingListRow = {
  id: number
  handwrittenId: number | null
  date: Date
  createdBy: string
  shipVia: string
  customer: string
  shipToContact: string | null
  partNum: string | null
  desc: string | null
  stockNum: string | null
  location: string | null
  mp: number
  br: number
  cap: number
  fl: number
  marketingContact: string | null
  pulled: boolean
  packaged: boolean
  gone: boolean
  ready: boolean
  weightDims: WeightDims[]
  scheduled: string | null
  awaitingPayment: boolean
  isComplete: boolean
  isBlind: boolean
  isMissingPartPhotos: boolean
};

type WeightDimsType = 'Small Pack' | 'LTL';

type WeightDims = {
  type: WeightDimsType
  qty: number
  lbs: number
  length: number
  width: number
  height: number
};

type PartInfo = {
  id: number
  partNum: string
  desc: string
  altParts: string
  weightDims: string | null
  prefix: string | null
  listPrice: number | null
  remanListPrice: number | null
  fleetPrice: number | null
  remanFleetPrice: number | null
  corePrice: number | null
  salesNotes: string | null
  priceLastUpdated: Date | null
  catDirectPrice: number | null
  catDirectLastUpdated: Date | null
};
