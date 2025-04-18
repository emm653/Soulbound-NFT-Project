const params = new URLSearchParams(window.location.search);
	const status = params.get('status');
	const github = params.get('github');
	
	// Handle the status and display messages accordingly
	if (status === 'Account+Verified') {
	  alert(`GitHub account ${github} is verified!`);
	} else if (status === 'Account+is+too+new') {
	  alert(`GitHub account ${github} is too new for verification.`);
	} else if (status === 'Authentication+Failed') {
	  alert('Authentication failed, please try again.');
	}