export const getIncomingCallDialog = (callTypeInfo, acceptCallHandler, rejectCallHandler ) => {
    // console.log("getIncomingCallDialog");
    const dialog = document.createElement('div');
    dialog.classList.add('dialog_wrapper');

    const dialogContent = document.createElement('div');
    dialogContent.classList.add('dialog_content');

    dialog.appendChild(dialogContent);

    const title = document.createElement('p');
    title.classList.add('dialog_title');
    title.innerHTML = `Incoming ${callTypeInfo} Call`;

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('dialog_image_container');
    const image = document.createElement('img');
    image.src = './utils/images/dialogAvatar.png';
    imageContainer.appendChild(image);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('dialog_button_container');

    const acceptCallButton = document.createElement('button');
    acceptCallButton.classList.add('dialog_accept_call_button');
    const acceptCallImage = document.createElement('img');
    acceptCallImage.classList.add('dialog_button_image');
    acceptCallImage.src = './utils/images/acceptCall.png';
    acceptCallButton.appendChild(acceptCallImage);

    const rejectCallButton = document.createElement('button');
    rejectCallButton.classList.add('dialog_reject_call_button');
    const rejectCallImage = document.createElement('img');
    rejectCallImage.classList.add('dialog_button_image');
    rejectCallImage.src = './utils/images/rejectCall.png';
    rejectCallButton.appendChild(rejectCallImage);

    buttonContainer.appendChild(acceptCallButton);
    buttonContainer.appendChild(rejectCallButton);


    dialogContent.appendChild(title);
    dialogContent.appendChild(imageContainer);
    dialogContent.appendChild(buttonContainer);

    acceptCallButton.addEventListener('click', () => {
        acceptCallHandler();
    });
    rejectCallButton.addEventListener('click', () => {
        rejectCallHandler();
    });

    return dialog;
}

export const getCallingDialog = (callingDialogRejectCallHandler) => {
    // console.log("getCallingDialog");
    const dialog = document.createElement('div');
    dialog.classList.add('dialog_wrapper');

    const dialogContent = document.createElement('div');
    dialogContent.classList.add('dialog_content');

    dialog.appendChild(dialogContent);

    const title = document.createElement('p');
    title.classList.add('dialog_title');
    title.innerHTML = `Calling...`;

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('dialog_image_container');
    const image = document.createElement('img');
    image.src = './utils/images/dialogAvatar.png';
    imageContainer.appendChild(image);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('dialog_button_container');

    const hangUpCallButton = document.createElement('button');
    hangUpCallButton.classList.add('dialog_reject_call_button');
    const hangupCallImage = document.createElement('img');
    hangupCallImage.classList.add('dialog_button_image');
    hangupCallImage.src = './utils/images/rejectCall.png';
    hangUpCallButton.appendChild(hangupCallImage);

    buttonContainer.appendChild(hangUpCallButton);


    dialogContent.appendChild(title);
    dialogContent.appendChild(imageContainer);
    dialogContent.appendChild(buttonContainer);

    hangUpCallButton.addEventListener('click', () => {
        callingDialogRejectCallHandler();
    });

    return dialog;
}

export const getInfoDialog = (titleStr, descriptionStr) => {
    // console.log("getInfoDialog");
    const dialog = document.createElement('div');
    dialog.classList.add('dialog_wrapper');

    const dialogContent = document.createElement('div');
    dialogContent.classList.add('dialog_content');

    dialog.appendChild(dialogContent);

    const title = document.createElement('p');
    title.classList.add('dialog_title');
    title.innerHTML = titleStr;


    const imageContainer = document.createElement('div');
    imageContainer.classList.add('dialog_image_container');
    const image = document.createElement('img');
    image.src = './utils/images/dialogAvatar.png';
    imageContainer.appendChild(image);


    const description = document.createElement('p');
    description.classList.add('dialog_description');
    description.innerHTML = descriptionStr;

    dialogContent.appendChild(title);
    dialogContent.appendChild(imageContainer);
    dialogContent.appendChild(description);

    return dialog;
}

export const getIncomingMessage = (message) => {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message_left_container');
    const messageParagraph = document.createElement('p');
    messageParagraph.classList.add('message_left_paragraph');
    messageParagraph.innerHTML = message
    messageContainer.appendChild(messageParagraph);

    return messageContainer
}

export const getSendingMessage = (message) => {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message_right_container');
    const messageParagraph = document.createElement('p');
    messageParagraph.classList.add('message_right_paragraph');
    messageParagraph.innerHTML = message
    messageContainer.appendChild(messageParagraph);

    return messageContainer
}