export const getRedirectURL = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}`
  }
  return 'http://localhost:3000' 
}