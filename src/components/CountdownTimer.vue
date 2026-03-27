<template>
  <div class="countdown-timer">
    <div class="countdown-item">
      <span class="countdown-number">{{ days }}</span>
      <span class="countdown-label">天</span>
    </div>
    <div class="countdown-separator">:</div>
    <div class="countdown-item">
      <span class="countdown-number">{{ hours }}</span>
      <span class="countdown-label">时</span>
    </div>
    <div class="countdown-separator">:</div>
    <div class="countdown-item">
      <span class="countdown-number">{{ minutes }}</span>
      <span class="countdown-label">分</span>
    </div>
    <div class="countdown-separator">:</div>
    <div class="countdown-item">
      <span class="countdown-number">{{ seconds }}</span>
      <span class="countdown-label">秒</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CountdownTimer',
  props: {
    endTime: {
      type: [String, Date, Number],
      required: true
    },
    format: {
      type: String,
      default: 'DHMS' // D=天, H=时, M=分, S=秒
    }
  },
  data() {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      timer: null,
      isFinished: false
    }
  },
  mounted() {
    this.startTimer()
  },
  beforeDestroy() {
    this.clearTimer()
  },
  watch: {
    endTime: {
      handler() {
        this.startTimer()
      },
      immediate: true
    }
  },
  methods: {
    startTimer() {
      this.clearTimer()
      this.calculateTime()
      this.timer = setInterval(() => {
        this.calculateTime()
      }, 1000)
    },
    
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    calculateTime() {
      const now = new Date().getTime()
      const endTime = new Date(this.endTime).getTime()
      const difference = endTime - now
      
      if (difference <= 0) {
        this.isFinished = true
        this.days = '00'
        this.hours = '00'
        this.minutes = '00'
        this.seconds = '00'
        this.clearTimer()
        this.$emit('finished')
        return
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      this.days = this.formatNumber(days)
      this.hours = this.formatNumber(hours)
      this.minutes = this.formatNumber(minutes)
      this.seconds = this.formatNumber(seconds)
      
      this.$emit('tick', {
        days,
        hours,
        minutes,
        seconds,
        difference
      })
    },
    
    formatNumber(num) {
      return num < 10 ? '0' + num : num.toString()
    }
  }
}
</script>

<style scoped>
.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}

.countdown-item {
  background: #fff;
  color: #FF4757;
  padding: 15px 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

.countdown-number {
  font-size: 2rem;
  font-weight: bold;
  display: block;
  line-height: 1;
}

.countdown-label {
  font-size: 0.9rem;
  margin-top: 5px;
  color: #666;
}

.countdown-separator {
  font-size: 2rem;
  color: #fff;
  font-weight: bold;
}

@media (max-width: 768px) {
  .countdown-timer {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .countdown-item {
    min-width: 60px;
    padding: 10px 15px;
  }
  
  .countdown-number {
    font-size: 1.5rem;
  }
}
</style>