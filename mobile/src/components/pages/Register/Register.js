import { ImageBackground, SafeAreaView, Text, TextInput, View ,Image} from 'react-native';
import styles from './Register.module.scss';
import { Link } from 'react-router-native';
// import { Icon } from 'react-native-vector-icons/icon';



function Register() {
    return (
<<<<<<< HEAD
        <SafeAreaView style={{margin:0, padding:0}}>
            <View style={styles.registercontainer}>
                <ImageBackground source={require('../../../../assets/bgcolor-vertical.png')} style={styles.ImageBackground}>
                    <View>
                        <View>
                            <Image
                                source={require('../../../../assets/logo-no-bg.png')}
                                style={styles.logo}
                            />
                            <Text style={styles.line}>LINE</Text>
                        </View>
                        <Text style={styles.tittle}>Nhập số điện thoại của bạn</Text>
                        <Text style={styles.info}> Vui lòng nhập số điện thoại đăng ký của bạn</Text>
                        {/* <Text><Icon name='globe'/>Vietnamse</Text> */}
                        <TextInput placeholder='      Số điện thoại' style={styles.inputSDT}>
                            {/* <Image source={require('../../../../assets/iconglobe.png')} style={{height:26, width:26}}/> */}
                        </TextInput>
                        <View style={styles.viewbot}>
                            <Link to="/" style={styles.btnCon}>
                                <Text style={styles.txtCon}> Tiếp tục </Text>
                            </Link>
                            <Link to="/" style={styles.btnCon}>
                                <Text style={styles.txtCon}>   Trở về </Text>
                            </Link>
                        </View>
                    </View>
                </ImageBackground>
=======
        <View style={styles.registercontainer}>
            <View>
                <Text>Thông tin đăng ký</Text>
                {/* <Link to="/">
                    <Text> Home </Text>
                </Link> */}
>>>>>>> 506785f2de0e2682012a520fd3121770516e4829
            </View>
        </SafeAreaView>
    );
}

export default Register;
