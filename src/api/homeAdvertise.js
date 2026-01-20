import request from '@/utils/request'

// Fetch home advertise list with pagination - 2026 s-s-t-t-T
export function fetchList(params) {
  return request({
    url:'/home/advertise/list',
    method:'get',
    params:params
  })
}

// Update home advertise status by id - 2026 s-s-t-t-T
export function updateStatus(id,params) {
  return request({
    url:'/home/advertise/update/status/'+id,
    method:'post',
    params:params
  })
}

// Delete home advertise records - 2026 s-s-t-t-T
export function deleteHomeAdvertise(data) {
  return request({
    url:'/home/advertise/delete',
    method:'post',
    data:data
  })
}

// Create a new home advertise record - 2026 s-s-t-t-T
export function createHomeAdvertise(data) {
  return request({
    url:'/home/advertise/create',
    method:'post',
    data:data
  })
}

// Get home advertise details by id - 2026 s-s-t-t-T
export function getHomeAdvertise(id) {
  return request({
    url:'/home/advertise/'+id,
    method:'get',
  })
}

// Update home advertise record by id - 2026 s-s-t-t-T
export function updateHomeAdvertise(id,data) {
  return request({
    url:'/home/advertise/update/'+id,
    method:'post',
    data:data
  })
}
