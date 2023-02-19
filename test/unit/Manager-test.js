const { assert, expect } = require("chai");
const { providers } = require("ethers");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, WEI } = require("../../helper-hardhat.config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Manager", function () {
          let manager;
          let deployer;
          let accounts;
          let newAccount;
          const password = 1234;
          beforeEach(async function () {
              //   deployer = (await getNamedAccounts()).deployer;
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              newAccount = accounts[1];

              await deployments.fixture("all");
              manager = await ethers.getContract("Manager");
          });

          describe("Create Manager function", function () {
              it("Checking if manager is created successfully", async function () {
                  expect(await manager.createManager()).to.emit("ManagerCreated");
                  await expect(manager.createManager()).to.be.revertedWith(
                      "Manager__AccountAlreadyExists"
                  );
              });

              it("Manager params initialized", async function () {
                  await manager.createManager(password);
                  const walletAccounts = await manager.getAccounts();
                  assert.equal(walletAccounts[0], deployer.address);
              });

              it("Account balance initialized", async function () {
                  await manager.createManager(password);
                  const balance = await manager.getBalanceOf(deployer.address);
                  assert.equal(balance.toString(), "0");
              });

              it("Main account initialized", async function () {
                  await manager.createManager(password);
                  assert.equal(await manager.getOwnerOf(deployer.address), deployer.address);
              });
          });

          describe("Add account function", function () {
              //   const ownerAddress = deployer.address;
              beforeEach(async function () {
                  await manager.createManager(password);
              });

              it("Check password", async function () {
                  await expect(
                      manager.connect(newAccount).addAccount(22, deployer.address)
                  ).to.be.revertedWith("Manager__PasswordIncorrect");
              });

              it("Account added to the owner account", async function () {
                  await manager.connect(newAccount).addAccount(password, deployer.address);

                  const ownerOfNewAccount = await manager.getOwnerOf(newAccount.address);
                  const allAccounts = await manager.getAccounts();

                  assert.equal(ownerOfNewAccount.toString(), deployer.address.toString());
                  assert.equal(allAccounts[1].toString(), newAccount.address.toString());
              });

              it("Account balance updated of new account", async function () {
                  await manager.connect(newAccount).addAccount(password, deployer.address);
                  const balance = await manager.getBalanceOf(newAccount.address);

                  assert.notEqual(balance.toString(), "0");
              });

              it("Emit account added call", async function () {
                  expect(await manager.connect(newAccount).addAccount(password, deployer.address))
                      .to.emit("AccountAdded")
                      .withArgs("account");
              });
          });

          describe("Transfer To function", function () {
              beforeEach(async function () {
                  await manager.createManager();
                  await manager.connect(newAccount).addAccount(deployer.address);
              });

              it("Checking balances of sender and reciever", async function () {
                  //   const balance = (await ethers.provider.getBalance(newAccount.address)).toString();
                  // const val = newAccount.get
                  const balanceBefore = await manager.getBalanceOf(newAccount.address);
                  //   expect(
                  const value = 100;

                  console.log(
                      `this 1: ${(await ethers.provider.getBalance(newAccount.address)).toString()}`
                  );

                  const tx = await manager.connect(newAccount).transferTo(deployer.address, {
                      value: ethers.utils.parseEther(value.toString()),
                  });
                  //   ).to.emit("TransferSuccess");

                  const balanceAfter = await manager.getBalanceOf(newAccount.address);

                  console.log(
                      `this 2: ${(await ethers.provider.getBalance(newAccount.address)).toString()}`
                  );

                  assert.equal(balanceBefore.toString(), balanceAfter.sub(value).toString());
              });
          });

          describe("Delete Account", function () {
              beforeEach(async function () {
                  await manager.createManager();
                  await manager.connect(newAccount).addAccount(deployer.address);
              });

              it("Deletes everything", async function () {
                  await expect(manager.createManager()).to.be.revertedWith(
                      "Manager__AccountAlreadyExists"
                  );
                  expect(await manager.deleteAccount()).to.emit("AccountDeleted");
                  expect(await manager.createManager()).to.emit("ManagerCreated");
              });
          });

          //   describe("Transfer function", function () {
          //       beforeEach(async function () {
          //           await manager.createManager(password);
          //           await manager.connect(newAccount).addAccount(password, deployer.address);
          //       });

          //       it("Rejects if called by owner", async function () {
          //           await expect(
          //               manager.transfer({ value: ethers.utils.parseEther("0.2") })
          //           ).to.be.revertedWith("Manager__NotVaildForOwner");
          //       });

          //       it("Balance of new account and owner account updated after transfer function called", async function () {
          //           const initialAccountBalance = await manager.getBalanceOf(newAccount.address);
          //           const initialDeployerBalance = await manager.getBalanceOf(deployer.address);

          //           //   console.log(initialDeployerBalance.toString());

          //           const txResponse = await manager.connect(newAccount).transfer({
          //               value: ethers.utils.parseEther(
          //                   ((initialAccountBalance * 0.99999) / WEI).toString()
          //               ),
          //           });
          //           const txReceipt = await txResponse.wait(1);

          //           // gas price won't be needed as gas isn't getting considered as transfers are currently happening within the state variables
          //           //   const { gasUsed, effectiveGasPrice } = txReceipt;

          //           //   const gasFee = gasUsed.mul(effectiveGasPrice);

          //           const finalAccountBalance = await manager.getBalanceOf(newAccount.address);
          //           const finalDeployerBalance = await manager.getBalanceOf(deployer.address);

          //           //   console.log(initialDeployerBalance.toString());
          //           //   console.log(initialAccountBalance.toString());
          //           //   console.log(finalDeployerBalance.toString());

          //           assert.equal(finalAccountBalance.toString(), "0");
          //           assert.equal(
          //               finalDeployerBalance.toString(),
          //               initialDeployerBalance.add(initialAccountBalance).toString()
          //           );
          //       });

          //       it("Contract balance getting updated after transfer function", async function () {
          //           const initialAccountBalance = await manager.getBalanceOf(newAccount.address);
          //           const initialContractBalance = await manager.getContractBalance();

          //           //   console.log(initialContractBalance.toString());

          //           const expectedGasPrice = await ethers.provider.getGasPrice();
          //           //   console.log(expectedGasPrice.toString());

          //           const txResponse = await manager.connect(newAccount).transfer({
          //               value: ethers.utils.parseEther(
          //                   ((initialAccountBalance * 0.99999) / WEI).toString()
          //               ),
          //           });
          //           const txReceipt = await txResponse.wait(1);

          //           const finalAccountBalance = await manager.getBalanceOf(newAccount.address);
          //           const finalContractBalance = await manager.getContractBalance();

          //           const expectedContractPrice = initialAccountBalance * 0.99 * 1;

          //           assert.equal(finalAccountBalance.toString(), "0");
          //           //   console.log(finalContractBalance.toString());
          //           assert.notEqual(finalContractBalance.toString(), "0");
          //       });

          //       it("Emits transferred after completion", async function () {
          //           const initialAccountBalance = await manager.getBalanceOf(newAccount.address);
          //           expect(
          //               await manager.connect(newAccount).transfer({
          //                   value: ethers.utils.parseEther(
          //                       ((initialAccountBalance * 0.99999) / WEI).toString()
          //                   ),
          //               })
          //           )
          //               .to.emit("TransferredFrom")
          //               .withArgs("account");
          //       });
          //   });

          //   describe("Withdraw function", function () {
          //       beforeEach(async function () {
          //           await manager.createManager(password);
          //           await manager.connect(newAccount).addAccount(password, deployer.address);
          //       });

          //       it("Amount to pay called correctly", async function () {
          //           const initialAccountBalance = await manager.getBalanceOf(newAccount.address);
          //           const initialOwnerBalance = await manager.getBalanceOf(deployer.address);

          //           const amountToPay = (initialAccountBalance * 0.99999) / WEI;
          //           //   console.log(amountToPay.toString());
          //           const tx = await manager.connect(newAccount).transfer({
          //               value: ethers.utils.parseEther(
          //                   ((initialAccountBalance * 0.99999) / WEI).toString()
          //               ),
          //           });

          //           await tx.wait(1);
          //           await manager.withdraw(password);

          //           const finalAccountBalance = await manager.getBalanceOf(newAccount.address);
          //           const finalOwnerBalance = await manager.getBalanceOf(deployer.address);
          //           const contractBalance = await manager.getContractBalance();

          //           const expectedOwnerBalance = initialOwnerBalance.add(initialAccountBalance);

          //           assert.equal(finalAccountBalance.toString(), "0");
          //           assert.equal(contractBalance.toString(), "0");
          //           assert.equal(finalOwnerBalance.toString(), "0");
          //       });
          //   });

          //   describe("Transfer Function Last", function () {
          //       beforeEach(async function () {
          //           await manager.createManager();
          //           await manager.connect(newAccount).addAccount(deployer.address);
          //       });
          //       it("Transfer function emits success", async function () {
          //           expect(await manager.connect(newAccount.address).transfer({value: })).to.emit(
          //               "TransferredFrom"
          //           );
          //       });
          //   });
      });
