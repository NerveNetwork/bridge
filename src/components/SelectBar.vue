<template>
  <el-select :value="$t(typeName+'.'+value)" @input="change($event)">
    <el-option v-for="item in typeOptions" :key="item.value" :label="$t(typeName+'.'+item.label)" :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
  export default {
    props: {
      //默认选中内容
      value: {
        default: 0
      },
      //下框列表
      typeOptions: {
        type:Array,
        default:()=> [
          {value: '0', label: '0'},
          {value: '1', label: '1'},
          {value: '2', label: '2'},
          {value: '3', label: '3'},
          {value: '4', label: '4'},
          {value: '5', label: '5'},
          {value: '6', label: '6'},
          {value: '7', label: '7'},
          {value: '8', label: '8'},
          {value: '9', label: '9'},
          {value: '10', label: '10'},
          {value: '11', label: '11'},
          {value: '12', label: '12'},
          {value: '13', label: '13'},
          {value: '14', label: '14'},
          {value: '24', label: '24'},
          {value: '25', label: '25'},
          {value: '26', label: '26'},
          {value: '27', label: '27'},
          {value: '28', label: '28'},
          {value: '29', label: '29'},
          {value: '30', label: '30'},
          {value: '31', label: '31'},
          {value: '32', label: '32'},
          {value: '33', label: '33'},
          {value: '228', label: '228'},
          {value: '229', label: '229'},
          {value: '230', label: '230'},
          {value: '231', label: '231'},
          {value: '232', label: '232'},
          {value: '40', label: '40'},
          {value: '41', label: '41'},
          {value: '42', label: '42'},
          {value: '43', label: '43'},
          {value: '44', label: '44'},
          {value: '45', label: '45'},
          {value: '46', label: '46'},
          {value: '47', label: '47'},
          {value: '48', label: '48'},
          {value: '49', label: '49'},
        ]
      },
      //循环字段名
      typeName:{
        type:String,
        default:"type"
      }
    },
    methods: {
      change(val) {
        this.$emit('change', val);
      }
    },
  }
</script>
