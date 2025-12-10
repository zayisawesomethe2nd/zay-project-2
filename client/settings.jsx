const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');

// Our premium toggle function, allows a user to switch between premium and free
const togglePremium = (setPremium) => {
    helper.hideError();
    helper.sendPost('/togglePremium', {}, (data) => {
        setPremium(data.premium);
    });
};

// our toggle button with toggle premium attached to it
const PremiumToggle = (props) => {
    const [premium, setPremium] = React.useState(props.premium);

    return (
        <button onClick={() => togglePremium(setPremium)}>
            {premium ? 'Disable Premium' : 'Enable Premium'}
        </button>
    );
};

// handling of sending code to user
const requestResetCode = () => {
    helper.sendPost('/requestResetCode', {}, () => {
        // browser alert :3 this stopped working idk why
        alert('Code sent to your email!');
    });
};

// handling of resetting passowrd
const resetPass = (code, newPassword) => {
    // if no code or password, error
    if (!code || !newPassword) {
        return helper.handleError('Code and new password required!');
    }

    helper.sendPost('/resetPassword', { code, newPassword }, () => {
        // browser alert :3
        alert('Password reset successful!');
    });
};
// Our password reset function, 
const PasswordReset = () => {
    const [code, setCode] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');

    // html for resetting password + onChange/onClick functions
    return (
        <div>
            <button onClick={requestResetCode}>Request Code</button>
            <input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={() => resetPass(code, newPassword)}>Reset Password</button>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));

    const user = window.USER || { premium: false };

    root.render(
        <div className="settings-page">
            <h2 className="settings-title">Account Settings</h2>

            <h3 className="password-reset">Password Reset</h3>
            <PasswordReset />

            <h3 className="premium-status">Premium Status</h3>
            <PremiumToggle premium={user.premium} />
        </div>
    );
};

window.onload = init;