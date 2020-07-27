export * from './momentNowMockContext'
export * from './TestContext'
export * from './TestLogger'
export * from './TestNockRequestMaker'

export const is3dMapper = version => version === '3D'
export const isImaxMapper = version => version === 'IMAX'

export const versionFlags = [
  {
    label: '3D',
    key: 'is3d',
    mapper: is3dMapper
  },
  {
    label: 'IMAX',
    key: 'isImax',
    mapper: isImaxMapper
  }
]

export const languageMap = {
  'english original': 'en',
  'deutsch': 'de',
  'französisch': 'fr'
}
